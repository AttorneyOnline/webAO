import type { PacketCodec } from "./index";

export interface PRPacket {
  id: number;
  type: number;
}

export const PR: PacketCodec<PRPacket> = {
  decode(args) {
    return { id: Number(args[1]), type: Number(args[2]) };
  },
  encode(packet) {
    return `PR#${packet.id}#${packet.type}#%`;
  },
};
