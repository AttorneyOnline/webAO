import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface BDPacket {
  reason: string;
}

export const BD: PacketCodec<BDPacket> = {
  decode(args) {
    return { reason: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `BD#${escapeChat(packet.reason)}#%`;
  },
};
