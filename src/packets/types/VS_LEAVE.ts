import type { PacketCodec } from "./index";

/**
 * Undocumented voice subsystem packet. Wire format: `VS_LEAVE#<uid>#%`.
 */
export interface VS_LEAVEPacket {
  uid: number;
}

export const VS_LEAVE: PacketCodec<VS_LEAVEPacket> = {
  decode(args) {
    return { uid: Number(args[1]) };
  },
  encode(packet) {
    return `VS_LEAVE#${packet.uid}#%`;
  },
};
