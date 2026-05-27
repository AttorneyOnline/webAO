import type { PacketCodec } from "./index";

/**
 * Undocumented voice subsystem packet. Wire format: `VS_JOIN#<uid>#%`.
 */
export interface VS_JOINPacket {
  uid: number;
}

export const VS_JOIN: PacketCodec<VS_JOINPacket> = {
  decode(args) {
    return { uid: Number(args[1]) };
  },
  encode(packet) {
    return `VS_JOIN#${packet.uid}#%`;
  },
};
