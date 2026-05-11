import { handleRemoteAudio } from "../../voice/voice";

// VS_AUDIO#<from_uid>#<b64_opus>#%  — server rebroadcasts a peer's encoded frame.
export const handleVS_AUDIO = (args: string[]) => {
  const fromUid = Number(args[1]);
  const payload = args[2] || "";
  if (!Number.isFinite(fromUid) || !payload) return;
  handleRemoteAudio(fromUid, payload);
};
