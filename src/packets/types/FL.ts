import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface FLPacket {
  features: string[];
}

export const FL: PacketCodec<FLPacket> = {
  decode(args) {
    return { features: args.slice(1).map((v) => unescapeChat(v)) };
  },
  encode(packet) {
    return `FL#${packet.features.map(escapeChat).join("#")}#%`;
  },
};
