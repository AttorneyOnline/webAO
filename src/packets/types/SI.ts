import type { PacketCodec } from "./index";

export interface SIPacket {
  charCnt: number;
  eviCnt: number;
  musCnt: number;
}

export const SI: PacketCodec<SIPacket> = {
  decode(args) {
    return {
      charCnt: Number(args[1]),
      eviCnt: Number(args[2]),
      musCnt: Number(args[3]),
    };
  },
  encode(packet) {
    return `SI#${packet.charCnt}#${packet.eviCnt}#${packet.musCnt}#%`;
  },
};
