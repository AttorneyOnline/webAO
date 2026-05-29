import { applyVoiceCaps } from "../voice/voice";
import { installVoiceUI } from "../voice/voiceUI";
import * as aolib from "../aolib";

/**
 * Voice subsystem capabilities. Undocumented (not in the official spec).
 * Wire format per the handler:
 *   VS_CAPS#<enabled>#<ptt_only>#<max_peers>#<codec>#<sample_rate>#<frame_ms>#<max_frame_bytes>#%
 */


// Arrives twice (after FL, again after DONE). Idempotent — use latest.
export const applyVoiceCapabilities = (packet: aolib.Out<typeof aolib.VS_CAPS>) => {
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
