import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { escapeChat, safeTags, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

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
  decode(args) {
    const parts = (args[2] ?? "").split("&");
    return {
      id: Number(args[1]),
      name: unescapeChat(parts[0] ?? ""),
      description: unescapeChat(parts[1] ?? ""),
      type: unescapeChat(parts[2] ?? ""),
      image: unescapeChat(parts[3] ?? ""),
    };
  },
  encode(packet) {
    const sub = `${escapeChat(packet.name)}&${escapeChat(packet.description)}&${escapeChat(packet.type)}&${escapeChat(packet.image)}&`;
    return `EI#${packet.id}#${sub}#%`;
  },
};

/**
 * Handles incoming evidence information, containing only one evidence
 * item per packet.
 */
export const handleEI = (packet: EIPacket) => {
  document.getElementById("client_loadingtext")!.innerHTML =
    `Loading Evidence ${packet.id}/${client.evidence_list_length}`;
  client.evidences[packet.id] = {
    name: safeTags(packet.name),
    desc: safeTags(packet.description),
    filename: packet.image,
    icon: `${AO_HOST}evidence/${encodeURI(packet.image.toLowerCase())}`,
  };

  client.sender.sendServer("AE" + (packet.id + 1) + "#%");
};
