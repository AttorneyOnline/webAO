import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

export interface PNPacket {
  playerCount: number;
  maxPlayers: number;
  serverDescription?: string;
}

export const PN: PacketCodec<PNPacket> = {
  decode(args) {
    const packet: PNPacket = {
      playerCount: Number(args[1]),
      maxPlayers: Number(args[2]),
    };
    if (args[3] !== undefined) {
      packet.serverDescription = unescapeChat(args[3]);
    }
    return packet;
  },
  encode(packet) {
    if (packet.serverDescription !== undefined) {
      return `PN#${packet.playerCount}#${packet.maxPlayers}#${escapeChat(packet.serverDescription)}#%`;
    }
    return `PN#${packet.playerCount}#${packet.maxPlayers}#%`;
  },
};

/**
 * Indicates how many users are on this server
 */
export const receivePN = (_packet: PNPacket) => {
  client.sendToServer("askchaa#%");
};
