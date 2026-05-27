import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { safeTags } from "../../encoding";
import type { LEPacket } from "../types/LE";

/**
 * Handles incoming evidence list, all evidences at once
 * item per packet.
 */
export const handleLE = (packet: LEPacket) => {
  client.evidences = [];
  for (let i = 0; i < packet.evidence.length; i++) {
    const ev = packet.evidence[i];
    client.evidences[i] = {
      name: safeTags(ev.name),
      desc: safeTags(ev.description),
      filename: ev.image,
      icon: `${AO_HOST}evidence/${encodeURI(ev.image.toLowerCase())}`,
    };
  }

  const evidence_box = document.getElementById("evidences");
  evidence_box.innerHTML = "";
  for (let i = 0; i <= client.evidences.length - 1; i++) {
    const evi_item = new Image();
    evi_item.id = "evi_" + i;
    evi_item.className = "evi_icon";
    evi_item.src = client.evidences[i].icon;
    evi_item.alt = client.evidences[i].name;
    evi_item.onclick = () => {
      window.pickEvidence(i);
    };
    evidence_box.appendChild(evi_item);
  }
};
