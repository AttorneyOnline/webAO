import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { safeTags } from "../../encoding";
import type { EIPacket } from "../types/EI";

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
