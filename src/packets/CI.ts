import { client } from "../client";
import { handleCharacterInfo } from "../client/handleCharacterInfo";
import type { PacketCodec } from "../packets";

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

/**
 * Handles incoming character information, bundling multiple characters
 * per packet.
 */
export const receiveCI = (packet: CIPacket) => {
  document.getElementById("client_loadingtext")!.innerHTML =
    `Loading Character ${packet.batchIndex}/${client.char_list_length}`;
  for (const { index, data } of packet.entries) {
    const chargs = data.split("&");
    setTimeout(() => handleCharacterInfo(chargs, index), 500);
  }
  // Request the next pack
  client.sendToServer(`AN#${packet.batchIndex / 10 + 1}#%`);
};
