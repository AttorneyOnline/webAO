import type { PacketCodec } from "./index";

/**
 * Server character list. The wire format packs each character's fields
 * (name/desc/evidence) into one `&`-delimited string per character slot.
 *
 * We keep the raw `&`-joined string per slot (without unescaping) because
 * downstream consumers re-split on `&` and unescape per-subfield. Unescaping
 * the whole slot here would convert `<and>` to literal `&` and corrupt the
 * split.
 */
export interface SCPacket {
  charData: string[];
}

export const SC: PacketCodec<SCPacket> = {
  decode(args) {
    return { charData: args.slice(1) };
  },
  encode(packet) {
    return `SC#${packet.charData.join("#")}#%`;
  },
};
