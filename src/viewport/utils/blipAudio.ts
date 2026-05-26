/**
 * Low-latency blip playback via the Web Audio API.
 *
 * HTMLAudioElement.play() is unreliable for short, rapid-fire sounds —
 * especially on Bluetooth (AirPods), where each .play() can wake/jitter
 * the A2DP audio stream and produce erratic blips. Web Audio keeps a
 * single AudioContext (= one open audio stream) and schedules each blip
 * sample-accurately into it.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

const buffers = new Map<string, AudioBuffer>();
const loading = new Set<string>();

let currentUrl: string | null = null;
let volume = 0.5;
let pitch = 1;
let muted = false;

function getAudioContext(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor: typeof AudioContext =
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!;
  if (!Ctor) return null;
  ctx = new Ctor();
  masterGain = ctx.createGain();
  masterGain.gain.value = muted ? 0 : volume;
  masterGain.connect(ctx.destination);
  return ctx;
}

async function preload(url: string): Promise<void> {
  if (buffers.has(url) || loading.has(url)) return;
  const audioCtx = getAudioContext();
  if (!audioCtx) return;
  loading.add(url);
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.arrayBuffer();
    buffers.set(url, await audioCtx.decodeAudioData(data));
  } catch {
    /* ignore — blip just won't play for this url */
  } finally {
    loading.delete(url);
  }
}

export function setBlipUrl(url: string): void {
  if (url === currentUrl) return;
  currentUrl = url;
  void preload(url);
}

export function setBlipVolume(v: number): void {
  volume = Math.max(0, Math.min(1, v));
  if (masterGain && !muted) masterGain.gain.value = volume;
}

export function setBlipPitch(p: number): void {
  pitch = Math.max(0.5, Math.min(2, Number(p) || 1));
}

export function setBlipMuted(m: boolean): void {
  muted = m;
  if (masterGain) masterGain.gain.value = muted ? 0 : volume;
}

/** Fire one blip. Silently no-ops if muted, unloaded, or context not ready. */
export function playBlip(): void {
  if (muted || !currentUrl) return;
  const audioCtx = getAudioContext();
  if (!audioCtx || !masterGain) return;
  const buffer = buffers.get(currentUrl);
  if (!buffer) return;
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = pitch;
  src.connect(masterGain);
  src.start(0);
}

/** Resume the AudioContext from a user-gesture handler. */
export function unlockBlipAudio(): void {
  const audioCtx = getAudioContext();
  if (audioCtx && audioCtx.state === "suspended") {
    void audioCtx.resume().catch(() => {});
  }
}
