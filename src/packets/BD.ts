import { client } from "../client";
import { handleBans } from "../client/handleBans";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

export interface BDPacket {
  reason: string;
}

export const BD: PacketCodec<BDPacket> = {
  header: "BD",
  decode(args) {
    return { reason: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `BD#${escapeChat(packet.reason)}#%`;
  },
};

/**
 * Handles the banned packet
 * this one is sent when you try to reconnect but you're banned
 */
export const receiveBD = (packet: BDPacket) => {
  client.banned = true;
  handleBans("Banned", packet.reason);
};
