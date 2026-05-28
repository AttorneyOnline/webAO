import type { PacketCodec } from "../packets";

/**
 * Client -> server "ask names" (character batch) pagination request. Asks
 * the server for batch `batch` of the character list, after the client has
 * consumed a `CI` batch. Wire: `AN#<batch>#%`.
 */
export interface ANPacket {
  batch: number;
}

export const AN: PacketCodec<ANPacket> = {
  header: "AN",
  decode() {
    throw new Error("AN is send-only");
  },
  encode(packet) {
    return `AN#${packet.batch}#%`;
  },
};
