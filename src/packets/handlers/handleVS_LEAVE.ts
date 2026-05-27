import { client } from "../../client";
import { handlePeerLeft, leaveVoice } from "../../voice/voice";
import type { VS_LEAVEPacket } from "../types/VS_LEAVE";

// If it's our own uid (server auto-kicked us, e.g. on area change or mod
// /voicearea off), tear down locally.
export const handleVS_LEAVE = (packet: VS_LEAVEPacket) => {
  if (!Number.isFinite(packet.uid)) return;
  if (packet.uid === client.playerID) {
    leaveVoice();
  } else {
    handlePeerLeft(packet.uid);
  }
};
