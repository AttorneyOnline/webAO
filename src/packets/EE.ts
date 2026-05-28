import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Edit-evidence packet. Client-to-server only -- the server broadcasts
 * the resulting evidence list back as an `LE` packet.
 */
export interface EEPacket {
  id: number;
  name: string;
  description: string;
  image: string;
}

export const EE: PacketCodec<EEPacket> = {
  header: "EE",
  decode: (args) => ({
    id: Number(args[1]),
    name: unescapeChat(args[2] ?? ""),
    description: unescapeChat(args[3] ?? ""),
    image: unescapeChat(args[4] ?? ""),
  }),
  encode: (p) =>
    `EE#${p.id}#${escapeChat(p.name)}#${escapeChat(p.description)}#${escapeChat(p.image)}#%`,
};

export const sendEE = (packet: EEPacket) => {
  client.sendPacket(EE, packet);
};
