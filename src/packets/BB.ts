import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

export interface BBPacket {
  message: string;
}

export const BB: PacketCodec<BBPacket> = {
  decode(args) {
    return { message: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `BB#${escapeChat(packet.message)}#%`;
  },
};

/**
 * Handles the warning packet
 * on client this spawns a message box you can't close for 2 seconds
 */
export const handleBB = (packet: BBPacket) => {
  alert(packet.message);
};
