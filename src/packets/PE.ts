import { client } from "../client";
import { escapeFanta, unescapeFanta } from "../escaping";
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
    name: unescapeFanta(args[1] ?? ""),
    description: unescapeFanta(args[2] ?? ""),
    image: unescapeFanta(args[3] ?? ""),
  }),
  encode: (p) =>
    `PE#${escapeFanta(p.name)}#${escapeFanta(p.description)}#${escapeFanta(p.image)}#%`,
};

export const sendPE = (packet: PEPacket) => {
  client.sendPacket(PE, packet);
};
