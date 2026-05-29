import { client } from "../client";
import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";
import { askchaa } from "./askchaa";

export interface PNPacket {
  player_count: number;
  max_players: number;
  server_description?: string;
}

export const PN: PacketCodec<PNPacket> = {
  header: "PN",
  decode(args) {
    const packet: PNPacket = {
      player_count: Number(args[1]),
      max_players: Number(args[2]),
    };
    if (args[3] !== undefined) {
      packet.server_description = unescapeFanta(args[3]);
    }
    return packet;
  },
  encode(packet) {
    if (packet.server_description !== undefined) {
      return `PN#${packet.player_count}#${packet.max_players}#${escapeFanta(packet.server_description)}#%`;
    }
    return `PN#${packet.player_count}#${packet.max_players}#%`;
  },
};

/**
 * Indicates how many users are on this server
 */
export const receivePN = (_packet: PNPacket) => {
  client.sendPacket(askchaa, {});
};
