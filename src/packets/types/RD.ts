import type { PacketCodec } from "./index";

export type RDPacket = Record<string, never>;

export const RD: PacketCodec<RDPacket> = {
  decode() {
    return {};
  },
  encode() {
    return `RD#%`;
  },
};
