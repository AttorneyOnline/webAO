import type { PacketCodec } from "./index";

export type RMPacket = Record<string, never>;

export const RM: PacketCodec<RMPacket> = {
  decode() {
    return {};
  },
  encode() {
    return `RM#%`;
  },
};
