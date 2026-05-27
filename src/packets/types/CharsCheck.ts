import type { PacketCodec } from "./index";

export interface CharsCheckPacket {
  taken: number[];
}

export const CharsCheck: PacketCodec<CharsCheckPacket> = {
  decode(args) {
    return { taken: args.slice(1).map((v) => Number(v)) };
  },
  encode(packet) {
    return `CharsCheck#${packet.taken.join("#")}#%`;
  },
};
