import { handlePeerJoined } from "../../voice/voice";
import type { VS_JOINPacket } from "../types/VS_JOIN";

export const handleVS_JOIN = (packet: VS_JOINPacket) => {
  if (!Number.isFinite(packet.uid)) return;
  void handlePeerJoined(packet.uid);
};
