import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface SPPacket {
  side: string;
}

export const SP: PacketCodec<SPPacket> = {
  decode(args) {
    return { side: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `SP#${escapeChat(packet.side)}#%`;
  },
};
