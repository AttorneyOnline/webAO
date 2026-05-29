import { client } from "../client";
import { handleBans } from "../client/handleBans";
import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";

export interface KKPacket {
  reason: string;
}

export const KK: PacketCodec<KKPacket> = {
  header: "KK",
  decode(args) {
    return { reason: unescapeFanta(args[1] ?? "") };
  },
  encode(packet) {
    return `KK#${escapeFanta(packet.reason)}#%`;
  },
};

/**
 * Handles the kicked packet
 */
export const receiveKK = (packet: KKPacket) => {
  client.banned = true;
  handleBans("Kicked", packet.reason);
};
