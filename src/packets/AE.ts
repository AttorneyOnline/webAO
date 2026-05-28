import type { PacketCodec } from "../packets";

/**
 * Client -> server "ask evidence" pagination request. Asks the server for
 * evidence item `id` (1-indexed), after the client has consumed an `EI`.
 * Wire: `AE#<id>#%`.
 */
export interface AEPacket {
  id: number;
}

export const AE: PacketCodec<AEPacket> = {
  header: "AE",
  decode() {
    throw new Error("AE is send-only");
  },
  encode(packet) {
    return `AE#${packet.id}#%`;
  },
};
