import type { PacketCodec } from "../packets";

/**
 * Client -> server "ask music" pagination request. Asks the server for
 * batch `batch` of the music list, after the client has consumed an `EM`
 * batch. Wire: `AM#<batch>#%`.
 */
export interface AMPacket {
  batch: number;
}

export const AM: PacketCodec<AMPacket> = {
  header: "AM",
  decode() {
    throw new Error("AM is send-only");
  },
  encode(packet) {
    return `AM#${packet.batch}#%`;
  },
};
