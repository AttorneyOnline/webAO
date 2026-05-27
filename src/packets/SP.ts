import { updateActionCommands } from "../dom/updateActionCommands";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

export interface SPPacket {
  side: string;
}

export const SP: PacketCodec<SPPacket> = {
  decode(args) {
    return { side: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `SP#${escapeChat(packet.side)}#%`;
  },
};

/**
 * position change
 */
export const handleSP = (packet: SPPacket) => {
  updateActionCommands(packet.side);
};
