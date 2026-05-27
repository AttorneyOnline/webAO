import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface BBPacket {
  message: string;
}

export const BB: PacketCodec<BBPacket> = {
  decode(args) {
    return { message: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `BB#${escapeChat(packet.message)}#%`;
  },
};
