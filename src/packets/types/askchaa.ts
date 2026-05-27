import type { PacketCodec } from "./index";

export type AskchaaPacket = Record<string, never>;

export const askchaa: PacketCodec<AskchaaPacket> = {
  decode() {
    return {};
  },
  encode() {
    return `askchaa#%`;
  },
};
