import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Add-evidence packet. Client-to-server only -- the server broadcasts
 * the resulting evidence list back as an `LE` packet.
 */
export interface PEPacket {
  name: string;
  desc: string;
  img: string;
}

export const PE: PacketCodec<PEPacket> = {
  decode: (args) => ({
    name: unescapeChat(args[1] ?? ""),
    desc: unescapeChat(args[2] ?? ""),
    img: unescapeChat(args[3] ?? ""),
  }),
  encode: (p) =>
    `PE#${escapeChat(p.name)}#${escapeChat(p.desc)}#${escapeChat(p.img)}#%`,
};

export const sendPE = (packet: PEPacket) => {
  client.sendToServer(PE.encode(packet));
};
