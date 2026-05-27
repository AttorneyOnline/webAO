import type { PacketCodec } from "./index";

export type RCPacket = Record<string, never>;

export const RC: PacketCodec<RCPacket> = {
  decode() {
    return {};
  },
  encode() {
    return `RC#%`;
  },
};
