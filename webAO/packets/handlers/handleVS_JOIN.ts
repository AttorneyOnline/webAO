import { handlePeerJoined } from "../../voice/voice";

// VS_JOIN#<uid>#%  — a peer joined the voice room.
export const handleVS_JOIN = (args: string[]) => {
  const uid = Number(args[1]);
  if (!Number.isFinite(uid)) return;
  void handlePeerJoined(uid);
};
