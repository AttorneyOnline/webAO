import type { PacketCodec } from "./index";

/**
 * Undocumented voice subsystem packet. Wire format:
 * `VS_SPEAK#<uid>#<on_off>#%`.
 */
export interface VS_SPEAKPacket {
  uid: number;
  on: boolean;
}

export const VS_SPEAK: PacketCodec<VS_SPEAKPacket> = {
  decode(args) {
    return { uid: Number(args[1]), on: args[2] === "1" };
  },
  encode(packet) {
    return `VS_SPEAK#${packet.uid}#${packet.on ? 1 : 0}#%`;
  },
};
