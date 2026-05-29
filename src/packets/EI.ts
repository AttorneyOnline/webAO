import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { escapeFanta, safeHtmlTags, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";
import { AE } from "./AE";

/**
 * Per-evidence incremental info packet. Wire format is
 * `EI#{id}#{name}&{description}&{type}&{image}&#%`.
 *
 * Subfields are unescaped individually since `&` is a control character at
 * this layer -- unescaping at the codec boundary would risk re-introducing
 * raw `&`s mid-string.
 */
export interface EIPacket {
  id: number;
  name: string;
  description: string;
  type: string;
  image: string;
}

export const EI: PacketCodec<EIPacket> = {
  header: "EI",
  decode(args) {
    const parts = (args[2] ?? "").split("&");
    return {
      id: Number(args[1]),
      name: unescapeFanta(parts[0] ?? ""),
      description: unescapeFanta(parts[1] ?? ""),
      type: unescapeFanta(parts[2] ?? ""),
      image: unescapeFanta(parts[3] ?? ""),
    };
  },
  encode(packet) {
    const sub = `${escapeFanta(packet.name)}&${escapeFanta(packet.description)}&${escapeFanta(packet.type)}&${escapeFanta(packet.image)}&`;
    return `EI#${packet.id}#${sub}#%`;
  },
};

/**
 * Handles incoming evidence information, containing only one evidence
 * item per packet.
 */
export const receiveEI = (packet: EIPacket) => {
  document.getElementById("client_loadingtext")!.innerHTML =
    `Loading Evidence ${packet.id}/${client.evidence_list_length}`;
  client.evidences[packet.id] = {
    name: safeHtmlTags(packet.name),
    desc: safeHtmlTags(packet.description),
    filename: packet.image,
    icon: `${AO_HOST}evidence/${encodeURI(packet.image.toLowerCase())}`,
  };

  client.sendPacket(AE, { id: packet.id + 1 });
};
