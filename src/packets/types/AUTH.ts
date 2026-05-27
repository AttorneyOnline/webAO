import type { PacketCodec } from "./index";

export interface AUTHPacket {
  authState: number;
}

export const AUTH: PacketCodec<AUTHPacket> = {
  decode(args) {
    return { authState: Number(args[1]) };
  },
  encode(packet) {
    return `AUTH#${packet.authState}#%`;
  },
};
