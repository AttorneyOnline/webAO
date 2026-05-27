import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface FAPacket {
  areas: string[];
}

export const FA: PacketCodec<FAPacket> = {
  decode(args) {
    return { areas: args.slice(1).map((v) => unescapeChat(v)) };
  },
  encode(packet) {
    return `FA#${packet.areas.map(escapeChat).join("#")}#%`;
  },
};
