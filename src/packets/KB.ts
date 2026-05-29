import { client } from "../client";
import { handleBans } from "../client/handleBans";
import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";

export interface KBPacket {
  reason: string;
}

export const KB: PacketCodec<KBPacket> = {
  header: "KB",
  decode(args) {
    return { reason: unescapeFanta(args[1] ?? "") };
  },
  encode(packet) {
    return `KB#${escapeFanta(packet.reason)}#%`;
  },
};

/**
 * Handles the banned packet
 * this one is sent when you are kicked off the server
 */
export const receiveKB = (packet: KBPacket) => {
  client.banned = true;
  handleBans("Banned", packet.reason);
};
