import { notifyRemoteSpeaking } from "../../voice/voice";

// VS_SPEAK#<uid>#<on_off>#%  — a peer started/stopped transmitting.
export const handleVS_SPEAK = (args: string[]) => {
  const uid = Number(args[1]);
  const on = args[2] === "1";
  if (!Number.isFinite(uid)) return;
  notifyRemoteSpeaking(uid, on);
};
