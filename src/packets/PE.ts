import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Add-evidence packet. Client-to-server only -- the server broadcasts
 * the resulting evidence list back as an `LE` packet.
 */
export interface PEPacket {
  name: string;
  description: string;
  image: string;
}

export const PE: PacketCodec<PEPacket> = {
  header: "PE",
  decode: (args) => ({
    name: unescapeChat(args[1] ?? ""),
    description: unescapeChat(args[2] ?? ""),
    image: unescapeChat(args[3] ?? ""),
  }),
  encode: (p) =>
    `PE#${escapeChat(p.name)}#${escapeChat(p.description)}#${escapeChat(p.image)}#%`,
};

export const sendPE = (packet: PEPacket) => {
  client.sendPacket(PE, packet);
};
