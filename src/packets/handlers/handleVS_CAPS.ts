import { applyVoiceCaps } from "../../voice/voice";
import { installVoiceUI } from "../../voice/voiceUI";
import type { VS_CAPSPacket } from "../types/VS_CAPS";

// Arrives twice (after FL, again after DONE). Idempotent — use latest.
export const handleVS_CAPS = (packet: VS_CAPSPacket) => {
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
