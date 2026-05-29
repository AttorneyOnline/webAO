import { client } from "../client";
import { escapeFanta, unescapeFanta } from "../escaping";
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
    name: unescapeFanta(args[2] ?? ""),
    description: unescapeFanta(args[3] ?? ""),
    image: unescapeFanta(args[4] ?? ""),
  }),
  encode: (p) =>
    `EE#${p.id}#${escapeFanta(p.name)}#${escapeFanta(p.description)}#${escapeFanta(p.image)}#%`,
};

export const sendEE = (packet: EEPacket) => {
  client.sendPacket(EE, packet);
};
