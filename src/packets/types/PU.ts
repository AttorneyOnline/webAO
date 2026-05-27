import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface PUPacket {
  id: number;
  type: number;
  data: string;
}

export const PU: PacketCodec<PUPacket> = {
  decode(args) {
    return {
      id: Number(args[1]),
      type: Number(args[2]),
      data: unescapeChat(args[3] ?? ""),
    };
  },
  encode(packet) {
    return `PU#${packet.id}#${packet.type}#${escapeChat(packet.data)}#%`;
  },
};
