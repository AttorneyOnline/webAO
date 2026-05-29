// Server-relayed voice transport.
//
// Every audio frame travels client -> AO2 server -> other clients over the
// existing AO2 WebSocket. There is no WebRTC, no STUN/TURN/ICE, no SDP.
// Peers never connect to each other, so their IPs cannot leak via packet
// capture — this is a structural privacy property of the transport.
//
// Wire protocol (`#` separator, `%` terminator; base64 needs no escaping):
//
//   Server -> client
//     VS_CAPS#<enabled>#<ptt_only>#<max_peers>#<codec>#<sample_rate>#<frame_ms>#<max_frame_bytes>#%
//     VS_PEERS#<csv_uids>#%
//     VS_JOIN#<uid>#%
//     VS_LEAVE#<uid>#%
//     VS_SPEAK#<uid>#<on_off>#%
//     VS_AUDIO#<from_uid>#<b64_opus>#%
//
//   Client -> server
//     VS_JOIN#%
//     VS_LEAVE#%
//     VS_FRAME#<b64_opus>#%
//     VS_SPEAK#<on_off>#%

import { client } from "../client";

interface VoiceCaps {
  enabled: boolean;
  pttOnly: boolean;
  maxPeers: number;
  codec: string;
  sampleRate: number;
  frameMs: number;
  maxFrameBytes: number;
}

let caps: VoiceCaps = {
  enabled: false,
  pttOnly: true,
  maxPeers: 0,
  codec: "opus",
  sampleRate: 48000,
  frameMs: 20,
  maxFrameBytes: 4096,
};

let audioCtx: AudioContext | null = null;
let workletReady = false;
let localStream: MediaStream | null = null;
let captureSourceNode: MediaStreamAudioSourceNode | null = null;
let captureNode: AudioWorkletNode | null = null;
let captureSink: GainNode | null = null;
let encoder: AudioEncoder | null = null;
let encoderTimestampUs = 0;

interface RemotePeer {
  decoder: AudioDecoder;
  playbackNode: AudioWorkletNode;
  gain: GainNode;
}

const remotePeers = new Map<number, RemotePeer>();
const speakingPeers = new Map<number, string>();
const speakingListeners: Array<() => void> = [];
const capsListeners: Array<() => void> = [];

let inVoice = false;
let listenOnly = false;
let pttActive = false;
let localOpenMic = false;
let lastEmittedSpeak = false;
let vcMuted = false;
let outputVolume = 1;
let currentDeviceId: string | null = null;

function webCodecsSupported(): boolean {
  if (typeof globalThis === "undefined") return false;
  const g = globalThis as unknown as {
    AudioEncoder?: unknown;
    AudioDecoder?: unknown;
    AudioData?: unknown;
    EncodedAudioChunk?: unknown;
  };
  return (
    typeof g.AudioEncoder === "function" &&
    typeof g.AudioDecoder === "function" &&
    typeof g.AudioData === "function" &&
    typeof g.EncodedAudioChunk === "function"
  );
}

function notifyCapsUpdated() {
  for (let i = 0; i < capsListeners.length; i++) {
    try {
      capsListeners[i]();
    } catch (e) {
      console.error(e);
    }
  }
  try {
    if (typeof window !== "undefined" && typeof CustomEvent === "function") {
      window.dispatchEvent(new CustomEvent("voice-caps-updated"));
    }
  } catch (_e) {
    // CustomEvent may be unavailable in unusual environments
  }
}

export function onCapsChange(listener: () => void): () => void {
  capsListeners.push(listener);
  return () => {
    const idx = capsListeners.indexOf(listener);
    if (idx >= 0) capsListeners.splice(idx, 1);
  };
}

function notifySpeakingListeners() {
  for (let i = 0; i < speakingListeners.length; i++) {
    try {
      speakingListeners[i]();
    } catch (e) {
      console.error(e);
    }
  }
}

function b64encode(bytes: Uint8Array): string {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode.apply(
      null,
      bytes.subarray(i, Math.min(i + chunk, bytes.length)) as unknown as number[],
    );
  }
  return btoa(s);
}

function b64decode(b64: string): Uint8Array {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

// Two worklet processors, registered once per AudioContext:
//   capture-processor  — chunks the mic stream into fixed-size frames and
//                        posts each frame to the main thread.
//   playback-processor — pulls decoded PCM frames from a queue fed by the
//                        main thread; primes with a few frames of buffer
//                        to absorb network jitter, drops back to silence
//                        and re-primes on underrun.
const WORKLET_CODE = `
class CaptureProcessor extends AudioWorkletProcessor {
  constructor(opts) {
    super(opts);
    const o = (opts && opts.processorOptions) || {};
    this.frameSamples = o.frameSamples | 0 || 960;
    this.buf = new Float32Array(this.frameSamples);
    this.pos = 0;
  }
  process(inputs, outputs) {
    const out = outputs[0];
    if (out && out[0]) out[0].fill(0);
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const ch = input[0];
    let i = 0;
    while (i < ch.length) {
      const space = this.frameSamples - this.pos;
      const copy = Math.min(space, ch.length - i);
      this.buf.set(ch.subarray(i, i + copy), this.pos);
      this.pos += copy;
      i += copy;
      if (this.pos === this.frameSamples) {
        const frame = this.buf.slice(0);
        this.port.postMessage(frame, [frame.buffer]);
        this.pos = 0;
      }
    }
    return true;
  }
}
class PlaybackProcessor extends AudioWorkletProcessor {
  constructor(opts) {
    super(opts);
    const o = (opts && opts.processorOptions) || {};
    this.targetQueue = o.targetQueueFrames | 0 || 3;
    this.queue = [];
    this.cur = null;
    this.curPos = 0;
    this.primed = false;
    this.port.onmessage = (e) => {
      if (e.data === "reset") {
        this.queue = []; this.cur = null; this.curPos = 0; this.primed = false;
        return;
      }
      this.queue.push(e.data);
    };
  }
  process(_inputs, outputs) {
    const out = outputs[0][0];
    if (!out) return true;
    if (!this.primed) {
      if (this.queue.length < this.targetQueue) {
        out.fill(0);
        return true;
      }
      this.primed = true;
    }
    let outPos = 0;
    while (outPos < out.length) {
      if (!this.cur) {
        if (this.queue.length === 0) {
          for (; outPos < out.length; outPos++) out[outPos] = 0;
          this.primed = false;
          break;
        }
        this.cur = this.queue.shift();
        this.curPos = 0;
      }
      const remaining = this.cur.length - this.curPos;
      const space = out.length - outPos;
      const copy = Math.min(remaining, space);
      out.set(this.cur.subarray(this.curPos, this.curPos + copy), outPos);
      this.curPos += copy;
      outPos += copy;
      if (this.curPos >= this.cur.length) this.cur = null;
    }
    return true;
  }
}
registerProcessor('capture-processor', CaptureProcessor);
registerProcessor('playback-processor', PlaybackProcessor);
`;

async function ensureAudioContext(): Promise<AudioContext> {
  if (!audioCtx || audioCtx.state === "closed") {
    const Ctor: typeof AudioContext =
      (window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      }).AudioContext ||
      (window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext!;
    audioCtx = new Ctor({ sampleRate: caps.sampleRate });
    // A freshly-created context needs a fresh worklet registration.
    workletReady = false;
  }
  // Worklet readiness is tied to the live AudioContext, not to "did we ever
  // call addModule" — retry on every call until it actually succeeds, so a
  // silent failure during the auto-join (non-gesture) path doesn't leave us
  // with an unusable context after the user clicks.
  if (!workletReady) {
    const blob = new Blob([WORKLET_CODE], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    try {
      await audioCtx.audioWorklet.addModule(url);
      workletReady = true;
    } catch (e) {
      console.error("voice: AudioWorklet addModule failed", e);
      throw e;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  if (audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch (_e) {
      // resume may fail if not user-gesture-driven; caller can detect via state
    }
  }
  return audioCtx;
}

function isLocalTransmitting(): boolean {
  if (!inVoice || listenOnly) return false;
  return localOpenMic || (caps.pttOnly ? pttActive : true);
}

function syncSpeakState(): void {
  const want = isLocalTransmitting();
  if (want === lastEmittedSpeak) return;
  lastEmittedSpeak = want;
  if (inVoice) {
    client.server.send.VS_SPEAK({ on: want });
  }
  notifySpeakingListeners();
}

function buildAudioConstraints(): MediaTrackConstraints {
  const constraints: MediaTrackConstraints = {
    sampleRate: caps.sampleRate,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };
  if (currentDeviceId) {
    constraints.deviceId = { exact: currentDeviceId };
  }
  return constraints;
}

async function startCapture(): Promise<void> {
  if (!localStream) return;
  const ctx = await ensureAudioContext();
  if (ctx.state !== "running") {
    console.warn(
      `voice: AudioContext is "${ctx.state}" after resume — audio may not flow until the user interacts again.`,
    );
  }
  const frameSamples = Math.max(1, Math.round((caps.sampleRate * caps.frameMs) / 1000));

  try {
    captureSourceNode = ctx.createMediaStreamSource(localStream);
  } catch (e) {
    console.error("voice: createMediaStreamSource failed", e);
    throw e;
  }
  try {
    captureNode = new AudioWorkletNode(ctx, "capture-processor", {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [1],
      processorOptions: { frameSamples },
    });
  } catch (e) {
    console.error(
      "voice: AudioWorkletNode construction failed (worklet may not have loaded)",
      e,
    );
    throw e;
  }
  // Sink at zero gain — keeps the worklet ticking without monitoring the mic
  // through the local speakers (which would cause feedback).
  captureSink = ctx.createGain();
  captureSink.gain.value = 0;

  const encoderConfig: AudioEncoderConfig = {
    codec: caps.codec,
    sampleRate: caps.sampleRate,
    numberOfChannels: 1,
    bitrate: 24000,
  };
  try {
    const support = await AudioEncoder.isConfigSupported(encoderConfig);
    if (!support.supported) {
      throw new Error(
        `AudioEncoder config not supported: codec=${caps.codec} sampleRate=${caps.sampleRate}`,
      );
    }
  } catch (e) {
    console.error("voice: encoder config check failed", e);
    throw e;
  }

  encoderTimestampUs = 0;
  encoder = new AudioEncoder({
    output: (chunk: EncodedAudioChunk) => {
      if (!isLocalTransmitting()) return;
      const buf = new Uint8Array(chunk.byteLength);
      chunk.copyTo(buf);
      const b64 = b64encode(buf);
      if (caps.maxFrameBytes > 0 && b64.length > caps.maxFrameBytes) {
        // Server would drop oversize frames anyway
        return;
      }
      client.server.send.VS_FRAME({ payload: b64 });
    },
    error: (e: DOMException) => {
      console.error("voice: encoder error", e);
    },
  });
  try {
    encoder.configure(encoderConfig);
  } catch (e) {
    console.error("voice: encoder.configure threw", e);
    throw e;
  }

  captureNode.port.onmessage = (ev: MessageEvent) => {
    if (!encoder || encoder.state !== "configured") return;
    if (!isLocalTransmitting()) return;
    const pcm = ev.data as Float32Array;
    const data = new AudioData({
      format: "f32-planar",
      sampleRate: caps.sampleRate,
      numberOfFrames: pcm.length,
      numberOfChannels: 1,
      timestamp: encoderTimestampUs,
      // Float32Array's generic ArrayBufferLike doesn't satisfy BufferSource in
      // TS 5.9's stricter lib.dom; the runtime accepts it.
      data: pcm as unknown as BufferSource,
    });
    encoderTimestampUs += Math.round((pcm.length / caps.sampleRate) * 1_000_000);
    try {
      encoder.encode(data);
    } finally {
      data.close();
    }
  };

  captureSourceNode.connect(captureNode);
  captureNode.connect(captureSink);
  captureSink.connect(ctx.destination);
}

function stopCapture(): void {
  if (captureSourceNode) {
    try { captureSourceNode.disconnect(); } catch (_e) { /* ignore */ }
    captureSourceNode = null;
  }
  if (captureNode) {
    try { captureNode.port.onmessage = null; } catch (_e) { /* ignore */ }
    try { captureNode.disconnect(); } catch (_e) { /* ignore */ }
    captureNode = null;
  }
  if (captureSink) {
    try { captureSink.disconnect(); } catch (_e) { /* ignore */ }
    captureSink = null;
  }
  if (encoder) {
    try { encoder.close(); } catch (_e) { /* ignore */ }
    encoder = null;
  }
  if (localStream) {
    const tracks = localStream.getTracks();
    for (let i = 0; i < tracks.length; i++) {
      try { tracks[i].stop(); } catch (_e) { /* ignore */ }
    }
    localStream = null;
  }
}

async function createRemotePeer(uid: number): Promise<RemotePeer | null> {
  if (!webCodecsSupported()) return null;
  const ctx = await ensureAudioContext();
  const playbackNode = new AudioWorkletNode(ctx, "playback-processor", {
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    processorOptions: { targetQueueFrames: 3 },
  });
  const gain = ctx.createGain();
  gain.gain.value = vcMuted ? 0 : outputVolume;
  playbackNode.connect(gain).connect(ctx.destination);

  const decoder = new AudioDecoder({
    output: (audioData: AudioData) => {
      const samples = audioData.numberOfFrames;
      const pcm = new Float32Array(samples);
      try {
        audioData.copyTo(pcm, { planeIndex: 0, format: "f32-planar" });
      } catch (_e) {
        try {
          audioData.copyTo(pcm, { planeIndex: 0 });
        } catch (e) {
          console.warn("voice: decoder copyTo failed", e);
        }
      }
      audioData.close();
      playbackNode.port.postMessage(pcm, [pcm.buffer]);
    },
    error: (e: DOMException) => {
      console.error(`voice: decoder error for peer ${uid}`, e);
    },
  });
  decoder.configure({
    codec: caps.codec,
    sampleRate: caps.sampleRate,
    numberOfChannels: 1,
  });

  const peer: RemotePeer = { decoder, playbackNode, gain };
  remotePeers.set(uid, peer);
  return peer;
}

function teardownPeer(uid: number): void {
  const peer = remotePeers.get(uid);
  if (!peer) return;
  try {
    if (peer.decoder.state !== "closed") peer.decoder.close();
  } catch (_e) { /* ignore */ }
  try { peer.playbackNode.port.postMessage("reset"); } catch (_e) { /* ignore */ }
  try { peer.playbackNode.disconnect(); } catch (_e) { /* ignore */ }
  try { peer.gain.disconnect(); } catch (_e) { /* ignore */ }
  remotePeers.delete(uid);
  if (speakingPeers.delete(uid)) notifySpeakingListeners();
}

function teardownAllPeers(): void {
  const uids: number[] = [];
  remotePeers.forEach((_p, uid) => uids.push(uid));
  for (let i = 0; i < uids.length; i++) teardownPeer(uids[i]);
}

function teardownAll(): void {
  stopCapture();
  teardownAllPeers();
  inVoice = false;
  listenOnly = false;
  pttActive = false;
  lastEmittedSpeak = false;
  speakingPeers.clear();
  notifySpeakingListeners();
}

export function applyVoiceCaps(
  enabled: boolean,
  pttOnly: boolean,
  maxPeers: number,
  codec: string,
  sampleRate: number,
  frameMs: number,
  maxFrameBytes: number,
): void {
  caps = {
    enabled,
    pttOnly,
    maxPeers,
    codec: codec || "opus",
    sampleRate: sampleRate || 48000,
    frameMs: frameMs || 20,
    maxFrameBytes: maxFrameBytes || 0,
  };
  console.debug(
    `voice: caps applied enabled=${enabled} ptt=${pttOnly} maxPeers=${maxPeers} codec=${caps.codec} sr=${caps.sampleRate} frame=${caps.frameMs}ms maxBytes=${caps.maxFrameBytes}`,
  );
  if (!enabled && inVoice) {
    teardownAll();
  }
  notifyCapsUpdated();
}

export function isVoiceAvailable(): boolean {
  return caps.enabled;
}

export function isPTTOnly(): boolean {
  return caps.pttOnly;
}

export function isInVoice(): boolean {
  return inVoice;
}

export function isListenOnly(): boolean {
  return listenOnly;
}

export async function joinVoiceListenOnly(): Promise<void> {
  if (!caps.enabled || inVoice) return;
  if (!webCodecsSupported()) {
    alert("Your browser does not support voice chat.");
    return;
  }
  try {
    await ensureAudioContext();
  } catch (e) {
    console.error("voice: failed to create AudioContext", e);
    return;
  }
  inVoice = true;
  listenOnly = true;
  client.server.send.VS_JOIN({});
  syncSpeakState();
}

export async function joinVoice(): Promise<void> {
  if (!caps.enabled) return;
  if (inVoice && !listenOnly) return;
  if (!webCodecsSupported()) {
    alert("Your browser does not support voice chat.");
    return;
  }

  const wasListenOnly = listenOnly;
  // Resume the AudioContext before getUserMedia so the resume() call lands
  // within the same transient user-activation window as the click.
  try {
    await ensureAudioContext();
  } catch (e) {
    console.error("voice: ensureAudioContext failed", e);
    throw e;
  }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: buildAudioConstraints(),
    });
  } catch (e) {
    console.error("Microphone permission denied or unavailable", e);
    throw e;
  }
  localStream = stream;
  try {
    await startCapture();
  } catch (e) {
    console.error("voice: failed to start capture", e);
    stopCapture();
    throw e;
  }
  if (!wasListenOnly) {
    inVoice = true;
    client.server.send.VS_JOIN({});
  }
  listenOnly = false;
  syncSpeakState();
}

export function leaveVoice(): void {
  if (!inVoice) return;
  if (lastEmittedSpeak) {
    lastEmittedSpeak = false;
    client.server.send.VS_SPEAK({ on: false });
  }
  client.server.send.VS_LEAVE({});
  teardownAll();
  notifyCapsUpdated();
}

export function setPTT(active: boolean): void {
  if (!inVoice) return;
  if (pttActive === active) return;
  pttActive = active;
  syncSpeakState();
}

export function isLocalOpenMic(): boolean {
  return localOpenMic;
}

export function setLocalOpenMic(enabled: boolean): void {
  if (localOpenMic === enabled) return;
  localOpenMic = enabled;
  syncSpeakState();
}

export async function handlePeerJoined(uid: number): Promise<void> {
  if (!inVoice || uid === client.playerID) return;
  if (caps.maxPeers > 0 && remotePeers.size >= caps.maxPeers) return;
  if (remotePeers.has(uid)) return;
  await createRemotePeer(uid);
}

export function handlePeerLeft(uid: number): void {
  teardownPeer(uid);
}

export async function handleInitialPeers(uids: number[]): Promise<void> {
  if (!inVoice) return;
  for (let i = 0; i < uids.length; i++) {
    const uid = uids[i];
    if (uid === client.playerID) continue;
    if (caps.maxPeers > 0 && remotePeers.size >= caps.maxPeers) break;
    if (remotePeers.has(uid)) continue;
    await createRemotePeer(uid);
  }
}

export function handleRemoteAudio(fromUid: number, b64: string): void {
  if (!inVoice) return;
  // Defensive: server should never echo our own audio back, but if it does, drop.
  if (fromUid === client.playerID) return;
  const peer = remotePeers.get(fromUid);
  if (!peer) {
    // Frame arrived before VS_JOIN — create the peer on demand.
    if (caps.maxPeers > 0 && remotePeers.size >= caps.maxPeers) return;
    void createRemotePeer(fromUid).then((p) => {
      if (p) feedDecoder(p, b64);
    });
    return;
  }
  feedDecoder(peer, b64);
}

function feedDecoder(peer: RemotePeer, b64: string): void {
  let bytes: Uint8Array;
  try {
    bytes = b64decode(b64);
  } catch (e) {
    console.warn("voice: failed to base64-decode incoming frame", e);
    return;
  }
  if (bytes.byteLength === 0) return;
  if (peer.decoder.state !== "configured") return;
  try {
    const chunk = new EncodedAudioChunk({
      type: "key",
      timestamp: 0,
      data: bytes,
    });
    peer.decoder.decode(chunk);
  } catch (e) {
    console.warn("voice: decode failed", e);
  }
}

export function notifyRemoteSpeaking(uid: number, on: boolean): void {
  if (uid === client.playerID) return;
  const label = resolveDisplayName(uid);
  const changed = on ? !speakingPeers.has(uid) : speakingPeers.has(uid);
  if (on) {
    speakingPeers.set(uid, label);
  } else {
    speakingPeers.delete(uid);
  }
  if (changed) notifySpeakingListeners();
}

export function onSpeakingChange(listener: () => void): () => void {
  speakingListeners.push(listener);
  return () => {
    const idx = speakingListeners.indexOf(listener);
    if (idx >= 0) speakingListeners.splice(idx, 1);
  };
}

export function getSpeakingLabels(): string[] {
  const labels: string[] = [];
  speakingPeers.forEach((label) => labels.push(label));
  return labels;
}

export function getSpeakingUids(): number[] {
  const uids: number[] = [];
  speakingPeers.forEach((_label, uid) => uids.push(uid));
  return uids;
}

export function isLocalSpeaking(): boolean {
  return isLocalTransmitting();
}

export function getLocalPlayerID(): number {
  return client ? client.playerID : -1;
}

function resolveDisplayName(uid: number): string {
  if (client && client.playerlist) {
    const entry = client.playerlist.get(uid);
    if (entry) {
      return entry.showName || entry.name || entry.charName || `Peer ${uid}`;
    }
  }
  return `Peer ${uid}`;
}

export function getSpeakerDisplayName(uid: number): string {
  return resolveDisplayName(uid);
}

export async function setInputDevice(deviceId: string): Promise<void> {
  const normalized = deviceId || null;
  if (normalized === currentDeviceId) return;
  currentDeviceId = normalized;
  if (!localStream) return;
  // Rebuild the capture pipeline on the new device.
  let newStream: MediaStream;
  try {
    newStream = await navigator.mediaDevices.getUserMedia({
      audio: buildAudioConstraints(),
    });
  } catch (e) {
    console.error("Failed to switch microphone", e);
    throw e;
  }
  stopCapture();
  localStream = newStream;
  await startCapture();
}

export function getInputDeviceId(): string | null {
  return currentDeviceId;
}

export function setOutputVolume(volume: number): void {
  const clamped = Math.max(0, Math.min(1, volume));
  outputVolume = clamped;
  if (!vcMuted) {
    remotePeers.forEach((peer) => {
      peer.gain.gain.value = clamped;
    });
  }
}

export function getOutputVolume(): number {
  return outputVolume;
}

export function isVCMuted(): boolean {
  return vcMuted;
}

export function setVCMuted(muted: boolean): void {
  vcMuted = muted;
  const vol = muted ? 0 : outputVolume;
  remotePeers.forEach((peer) => {
    peer.gain.gain.value = vol;
  });
}

// ---------------------------------------------------------------------
// Inbound packet handlers. Registered against the aolib session in
// `src/packets.ts` and dispatched on s2c traffic.
// ---------------------------------------------------------------------

import { installVoiceUI } from "./voiceUI";
import type * as aolib from "../aolib";

/** VS_CAPS: server announces voice subsystem capabilities (idempotent). */
export const applyVoiceCapabilities = (packet: aolib.VS_CAPSPacket) => {
  console.debug(
    `voice: VS_CAPS received enabled=${packet.enabled} ptt=${packet.pttOnly} maxPeers=${packet.maxPeers} codec=${packet.codec} sr=${packet.sampleRate} frame=${packet.frameMs}ms maxBytes=${packet.maxFrameBytes}`,
  );
  installVoiceUI();
  applyVoiceCaps(
    packet.enabled,
    packet.pttOnly,
    packet.maxPeers,
    packet.codec,
    packet.sampleRate,
    packet.frameMs,
    packet.maxFrameBytes,
  );
};

/** VS_PEERS: initial list of voice-active peer uids when we join. */
export const applyVoicePeerList = (packet: aolib.VS_PEERSPacket) => {
  void handleInitialPeers(packet.uids);
};

/** VS_JOIN: a remote peer joined the voice mesh. */
export const handleVoicePeerJoin = (packet: aolib.VS_JOINPacket) => {
  if (!Number.isFinite(packet.uid)) return;
  void handlePeerJoined(packet.uid);
};

/**
 * VS_LEAVE: a remote peer left the voice mesh. If it's our own uid
 * (server auto-kicked us, e.g. on area change or `/voicearea off`),
 * we tear down locally instead.
 */
export const handleVoicePeerLeave = (packet: aolib.VS_LEAVEPacket) => {
  if (!Number.isFinite(packet.uid)) return;
  if (packet.uid === client.playerID) {
    leaveVoice();
  } else {
    handlePeerLeft(packet.uid);
  }
};

/** VS_SPEAK: a remote peer toggled their speaking-state indicator. */
export const applyVoicePeerSpeak = (packet: aolib.VS_SPEAKPacket) => {
  if (!Number.isFinite(packet.uid)) return;
  notifyRemoteSpeaking(packet.uid, packet.on);
};

/** VS_AUDIO: opus audio frame from a remote peer; play it. */
export const handleVoiceAudio = (packet: aolib.VS_AUDIOPacket) => {
  if (!Number.isFinite(packet.fromUid) || !packet.payload) return;
  handleRemoteAudio(packet.fromUid, packet.payload);
};
