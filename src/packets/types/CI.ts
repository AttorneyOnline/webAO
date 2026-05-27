import type { PacketCodec } from "./index";

/**
 * Incremental character info packet. Wire format is
 * `CI#{batch_index}#{idx0}#{data0}#{idx1}#{data1}#...#%` where each `data`
 * is an `&`-delimited blob describing one character. The handler re-splits
 * `data` on `&` itself, so we keep it as the raw (still-escaped) string per
 * slot to avoid corrupting the `&` separators.
 */
export interface CIPacket {
  batchIndex: number;
  entries: { index: number; data: string }[];
}

export const CI: PacketCodec<CIPacket> = {
  decode(args) {
    const batchIndex = Number(args[1]);
    const entries: { index: number; data: string }[] = [];
    // args = ["CI", batchIndex, idx0, data0, idx1, data1, ..., ""]
    for (let i = 2; i < args.length - 1; i += 2) {
      if (args[i + 1] === undefined) break;
      entries.push({ index: Number(args[i]), data: args[i + 1] });
    }
    return { batchIndex, entries };
  },
  encode(packet) {
    const flat = packet.entries
      .map((e) => `${e.index}#${e.data}`)
      .join("#");
    return `CI#${packet.batchIndex}#${flat}#%`;
  },
};
