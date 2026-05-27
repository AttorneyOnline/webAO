import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface KKPacket {
  reason: string;
}

export const KK: PacketCodec<KKPacket> = {
  decode(args) {
    return { reason: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `KK#${escapeChat(packet.reason)}#%`;
  },
};
