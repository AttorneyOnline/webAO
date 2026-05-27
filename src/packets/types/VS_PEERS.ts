import type { PacketCodec } from "./index";

/**
 * Undocumented voice subsystem packet. Wire format:
 * `VS_PEERS#<csv_uids>#%`. The comma-separated list is intentionally kept as
 * a single string here so the handler can preserve its own empty/invalid
 * filtering semantics.
 */
export interface VS_PEERSPacket {
  uids: number[];
}

export const VS_PEERS: PacketCodec<VS_PEERSPacket> = {
  decode(args) {
    const csv = args[1] || "";
    const uids: number[] = [];
    if (csv.length > 0) {
      for (const part of csv.split(",")) {
        const n = Number(part);
        if (Number.isFinite(n)) uids.push(n);
      }
    }
    return { uids };
  },
  encode(packet) {
    return `VS_PEERS#${packet.uids.join(",")}#%`;
  },
};
