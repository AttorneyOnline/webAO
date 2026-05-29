import { client } from "../client";
import { handleBans } from "../client/handleBans";
import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";

export interface BDPacket {
  reason: string;
}

export const BD: PacketCodec<BDPacket> = {
  header: "BD",
  decode(args) {
    return { reason: unescapeFanta(args[1] ?? "") };
  },
  encode(packet) {
    return `BD#${escapeFanta(packet.reason)}#%`;
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
