import type { PacketCodec } from "./index";

export interface JDPacket {
  state: number;
}

export const JD: PacketCodec<JDPacket> = {
  decode(args) {
    return { state: Number(args[1]) };
  },
  encode(packet) {
    return `JD#${packet.state}#%`;
  },
};
