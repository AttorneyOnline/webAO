import { client } from "../client";
import type { PacketCodec } from "../packets";

/**
 * Delete-evidence packet. Client-to-server only -- the server broadcasts
 * the resulting evidence list back as an `LE` packet.
 */
export interface DEPacket {
  id: number;
}

export const DE: PacketCodec<DEPacket> = {
  decode: (args) => ({ id: Number(args[1]) }),
  encode: (packet) => `DE#${packet.id}#%`,
};

export const sendDE = (packet: DEPacket) => {
  client.sendToServer(DE.encode(packet));
};
