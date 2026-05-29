import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { pickEvidence } from "../dom/pickEvidence";
import { escapeFanta, safeHtmlTags, unescapeFanta } from "../escaping";
import * as aolib from "../aolib";

export interface EvidenceData {
  name: string;
  description: string;
  image: string;
}



/**
 * Handles incoming evidence list, all evidences at once
 * item per packet.
 */
export const applyEvidenceList = (packet: aolib.Out<typeof aolib.LE>) => {
  client.evidences = [];
  for (let i = 0; i < packet.evidence.length; i++) {
    const ev = packet.evidence[i];
    client.evidences[i] = {
      name: safeHtmlTags(ev.name),
      desc: safeHtmlTags(ev.description),
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
      pickEvidence(i);
    };
    evidence_box.appendChild(evi_item);
  }
};
