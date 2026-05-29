import { client } from "../client";
import { createArea } from "../client/createArea";
import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";

export interface FAPacket {
  areas: string[];
}

export const FA: PacketCodec<FAPacket> = {
  header: "FA",
  decode(args) {
    return { areas: args.slice(1).map((v) => unescapeFanta(v)) };
  },
  encode(packet) {
    return `FA#${packet.areas.map(escapeFanta).join("#")}#%`;
  },
};

/**
 * Handles updated area list
 */
export const receiveFA = (packet: FAPacket) => {
  client.resetAreaList();

  for (let i = 0; i < packet.areas.length; i++) {
    createArea(i, packet.areas[i]);
  }
};
