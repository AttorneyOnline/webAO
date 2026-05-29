import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";
import { applyVoiceCaps } from "../voice/voice";
import { installVoiceUI } from "../voice/voiceUI";

/**
 * Voice subsystem capabilities. Undocumented (not in the official spec).
 * Wire format per the handler:
 *   VS_CAPS#<enabled>#<ptt_only>#<max_peers>#<codec>#<sample_rate>#<frame_ms>#<max_frame_bytes>#%
 */
export interface VS_CAPSPacket {
  enabled: boolean;
  pttOnly: boolean;
  maxPeers: number;
  codec: string;
  sampleRate: number;
  frameMs: number;
  maxFrameBytes: number;
}

export const VS_CAPS: PacketCodec<VS_CAPSPacket> = {
  header: "VS_CAPS",
  decode(args) {
    return {
      enabled: args[1] === "1",
      pttOnly: args[2] === "1",
      maxPeers: Number(args[3]) || 0,
      codec: unescapeFanta(args[4] ?? "") || "opus",
      sampleRate: Number(args[5]) || 48000,
      frameMs: Number(args[6]) || 20,
      maxFrameBytes: Number(args[7]) || 0,
    };
  },
  encode(packet) {
    return `VS_CAPS#${packet.enabled ? 1 : 0}#${packet.pttOnly ? 1 : 0}#${packet.maxPeers}#${escapeFanta(packet.codec)}#${packet.sampleRate}#${packet.frameMs}#${packet.maxFrameBytes}#%`;
  },
};

// Arrives twice (after FL, again after DONE). Idempotent — use latest.
export const receiveVS_CAPS = (packet: VS_CAPSPacket) => {
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
