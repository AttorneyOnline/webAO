import { handleRemoteAudio } from "../../voice/voice";
import type { VS_AUDIOPacket } from "../types/VS_AUDIO";

export const handleVS_AUDIO = (packet: VS_AUDIOPacket) => {
  if (!Number.isFinite(packet.fromUid) || !packet.payload) return;
  handleRemoteAudio(packet.fromUid, packet.payload);
};
