import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

/**
 * Incremental music/area list packet. Wire format is essentially
 * `EM#{batch_index}#{idx0}#{name0}#{idx1}#{name1}#...#%`. The trailing entry
 * is empty due to wire-format split semantics, so we drop it.
 */
export interface EMPacket {
  batchIndex: number;
  // TODO: confirm field meaning -- legacy handler treats odd-indexed pairs
  // as `(trackIndex, trackName)`.
  entries: { index: number; name: string }[];
}

export const EM: PacketCodec<EMPacket> = {
  decode(args) {
    const batchIndex = Number(args[1]);
    const entries: { index: number; name: string }[] = [];
    // args = ["EM", batchIndex, idx0, name0, idx1, name1, ..., ""]
    for (let i = 2; i < args.length - 1; i += 2) {
      if (args[i + 1] === undefined) break;
      entries.push({
        index: Number(args[i]),
        name: unescapeChat(args[i + 1]),
      });
    }
    return { batchIndex, entries };
  },
  encode(packet) {
    const flat = packet.entries
      .map((e) => `${e.index}#${escapeChat(e.name)}`)
      .join("#");
    return `EM#${packet.batchIndex}#${flat}#%`;
  },
};
