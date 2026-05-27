import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface FMPacket {
  musicList: string[];
}

export const FM: PacketCodec<FMPacket> = {
  decode(args) {
    return { musicList: args.slice(1).map((v) => unescapeChat(v)) };
  },
  encode(packet) {
    return `FM#${packet.musicList.map(escapeChat).join("#")}#%`;
  },
};
