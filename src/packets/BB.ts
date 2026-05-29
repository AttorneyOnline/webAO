import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";

export interface BBPacket {
  message: string;
}

export const BB: PacketCodec<BBPacket> = {
  header: "BB",
  decode(args) {
    return { message: unescapeFanta(args[1] ?? "") };
  },
  encode(packet) {
    return `BB#${escapeFanta(packet.message)}#%`;
  },
};

/**
 * Handles the warning packet
 * on client this spawns a message box you can't close for 2 seconds
 */
export const receiveBB = (packet: BBPacket) => {
  alert(packet.message);
};
