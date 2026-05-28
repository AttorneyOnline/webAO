import type { PacketCodec } from "../packets";
import { handleRemoteAudio } from "../voice/voice";

/**
 * Undocumented voice subsystem packet. Wire format:
 * `VS_AUDIO#<from_uid>#<b64_opus>#%`. The payload is base64-encoded opus
 * (no FantaCode escaping is applied since base64 doesn't include any of
 * the reserved characters).
 */
export interface VS_AUDIOPacket {
  fromUid: number;
  payload: string;
}

export const VS_AUDIO: PacketCodec<VS_AUDIOPacket> = {
  decode(args) {
    return { fromUid: Number(args[1]), payload: args[2] || "" };
  },
  encode(packet) {
    return `VS_AUDIO#${packet.fromUid}#${packet.payload}#%`;
  },
};

export const receiveVS_AUDIO = (packet: VS_AUDIOPacket) => {
  if (!Number.isFinite(packet.fromUid) || !packet.payload) return;
  handleRemoteAudio(packet.fromUid, packet.payload);
};
