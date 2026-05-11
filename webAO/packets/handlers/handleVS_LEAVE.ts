import { client } from "../../client";
import { handlePeerLeft, leaveVoice } from "../../voice/voice";

// VS_LEAVE#<uid>#%  — a peer left the voice room. If it's our own uid (server
// auto-kicked us, e.g. on area change or mod /voicearea off), tear down locally.
export const handleVS_LEAVE = (args: string[]) => {
  const uid = Number(args[1]);
  if (!Number.isFinite(uid)) return;
  if (uid === client.playerID) {
    leaveVoice();
  } else {
    handlePeerLeft(uid);
  }
};
