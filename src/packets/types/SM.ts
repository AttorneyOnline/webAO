import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface SMPacket {
  musicList: string[];
}

export const SM: PacketCodec<SMPacket> = {
  decode(args) {
    return { musicList: args.slice(1).map((v) => unescapeChat(v)) };
  },
  encode(packet) {
    return `SM#${packet.musicList.map(escapeChat).join("#")}#%`;
  },
};
