import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

/**
 * `updateType` selects what the rest of the packet means:
 *   0: player counts (numbers per area)
 *   1: area statuses (strings)
 *   2: case manager names (strings)
 *   3: locked states (strings)
 *
 * We keep `updateData` as `(number | string)[]` rather than a discriminated
 * union since the values arrive as strings on the wire and the handler picks
 * the cell-level type itself.
 */
export interface ARUPPacket {
  updateType: 0 | 1 | 2 | 3;
  updateData: (number | string)[];
}

export const ARUP: PacketCodec<ARUPPacket> = {
  decode(args) {
    const updateType = Number(args[1]) as 0 | 1 | 2 | 3;
    const rest = args.slice(2);
    const updateData =
      updateType === 0
        ? rest.map((v) => Number(v))
        : rest.map((v) => unescapeChat(v));
    return { updateType, updateData };
  },
  encode(packet) {
    const data = packet.updateData
      .map((v) => (typeof v === "string" ? escapeChat(v) : v))
      .join("#");
    return `ARUP#${packet.updateType}#${data}#%`;
  },
};
