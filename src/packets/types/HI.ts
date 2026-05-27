import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface HIPacket {
  hdid: string;
}

export const HI: PacketCodec<HIPacket> = {
  decode(args) {
    return { hdid: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `HI#${escapeChat(packet.hdid)}#%`;
  },
};
