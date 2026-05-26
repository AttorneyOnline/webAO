import { applyVoiceCaps } from "../../voice/voice";
import { installVoiceUI } from "../../voice/voiceUI";

// VS_CAPS#<enabled>#<ptt_only>#<max_peers>#<codec>#<sample_rate>#<frame_ms>#<max_frame_bytes>#%
// Arrives twice (after FL, again after DONE). Idempotent — use latest.
export const handleVS_CAPS = (args: string[]) => {
  const enabled = args[1] === "1";
  const pttOnly = args[2] === "1";
  const maxPeers = Number(args[3]) || 0;
  const codec = args[4] || "opus";
  const sampleRate = Number(args[5]) || 48000;
  const frameMs = Number(args[6]) || 20;
  const maxFrameBytes = Number(args[7]) || 0;
  console.debug(
    `voice: VS_CAPS received enabled=${args[1]} ptt=${args[2]} maxPeers=${args[3]} codec=${codec} sr=${sampleRate} frame=${frameMs}ms maxBytes=${maxFrameBytes}`,
  );
  installVoiceUI();
  applyVoiceCaps(enabled, pttOnly, maxPeers, codec, sampleRate, frameMs, maxFrameBytes);
};
