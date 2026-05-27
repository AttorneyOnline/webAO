import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface KBPacket {
  reason: string;
}

export const KB: PacketCodec<KBPacket> = {
  decode(args) {
    return { reason: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `KB#${escapeChat(packet.reason)}#%`;
  },
};
