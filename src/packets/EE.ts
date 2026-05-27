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
  desc: string;
  img: string;
}

export const EE: PacketCodec<EEPacket> = {
  decode: (args) => ({
    id: Number(args[1]),
    name: unescapeChat(args[2] ?? ""),
    desc: unescapeChat(args[3] ?? ""),
    img: unescapeChat(args[4] ?? ""),
  }),
  encode: (p) =>
    `EE#${p.id}#${escapeChat(p.name)}#${escapeChat(p.desc)}#${escapeChat(p.img)}#%`,
};

export const sendEE = (packet: EEPacket) => {
  client.sendToServer(EE.encode(packet));
};
