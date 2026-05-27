import { notifyRemoteSpeaking } from "../../voice/voice";
import type { VS_SPEAKPacket } from "../types/VS_SPEAK";

export const handleVS_SPEAK = (packet: VS_SPEAKPacket) => {
  if (!Number.isFinite(packet.uid)) return;
  notifyRemoteSpeaking(packet.uid, packet.on);
};
