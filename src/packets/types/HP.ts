import type { PacketCodec } from "./index";

export interface HPPacket {
  bar: number;
  value: number;
}

export const HP: PacketCodec<HPPacket> = {
  decode(args) {
    return { bar: Number(args[1]), value: Number(args[2]) };
  },
  encode(packet) {
    return `HP#${packet.bar}#${packet.value}#%`;
  },
};
