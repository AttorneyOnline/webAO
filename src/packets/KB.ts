import { client } from "../client";
import { handleBans } from "../client/handleBans";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

export interface KBPacket {
  reason: string;
}

export const KB: PacketCodec<KBPacket> = {
  decode(args) {
    return { reason: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `KB#${escapeChat(packet.reason)}#%`;
  },
};

/**
 * Handles the banned packet
 * this one is sent when you are kicked off the server
 */
export const handleKB = (packet: KBPacket) => {
  client.banned = true;
  handleBans("Banned", packet.reason);
};
