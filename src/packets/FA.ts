import { client } from "../client";
import { createArea } from "../client/createArea";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

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

/**
 * Handles updated area list
 */
export const handleFA = (packet: FAPacket) => {
  client.resetAreaList();

  for (let i = 0; i < packet.areas.length; i++) {
    createArea(i, packet.areas[i]);
  }
};
