import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface BNPacket {
  background: string;
  position?: string;
}

export const BN: PacketCodec<BNPacket> = {
  decode(args) {
    const packet: BNPacket = { background: unescapeChat(args[1] ?? "") };
    if (args[2] !== undefined) {
      packet.position = unescapeChat(args[2]);
    }
    return packet;
  },
  encode(packet) {
    const background = escapeChat(packet.background);
    if (packet.position !== undefined) {
      return `BN#${background}#${escapeChat(packet.position)}#%`;
    }
    return `BN#${background}#%`;
  },
};
