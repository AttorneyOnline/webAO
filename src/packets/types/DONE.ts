import type { PacketCodec } from "./index";

export type DONEPacket = Record<string, never>;

export const DONE: PacketCodec<DONEPacket> = {
  decode() {
    return {};
  },
  encode() {
    return `DONE#%`;
  },
};
