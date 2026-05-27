import { updateActionCommands } from "../dom/updateActionCommands";
import type { PacketCodec } from "../packets";
import { Side, parseSide } from "./MS";

export interface SPPacket {
  side: Side;
}

export const SP: PacketCodec<SPPacket> = {
  decode(args) {
    return { side: parseSide(args[1]) };
  },
  encode(packet) {
    return `SP#${packet.side}#%`;
  },
};

/**
 * position change
 */
export const receiveSP = (packet: SPPacket) => {
  updateActionCommands(packet.side);
};
