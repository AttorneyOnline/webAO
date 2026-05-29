import { client } from "../client";
import { cancelEvidence } from "./cancelEvidence";
import { updateEvidenceIcon } from "./updateEvidenceIcon";
import { getIndexFromSelect } from "./getIndexFromSelect";

/**
 * Highlights and selects an evidence for in-character chat.
 * @param {string} evidence the evidence to be presented
 */
export function pickEvidence(evidence: number) {
  if (client.selectedEvidence !== evidence) {
    // Update selected evidence
    if (client.selectedEvidence >= 0) {
      document.getElementById(`evi_${client.selectedEvidence}`)!.className =
        "evi_icon";
    }
    document.getElementById(`evi_${evidence}`)!.className = "evi_icon dark";
    client.selectedEvidence = evidence;

    // Show evidence on information window
    (<HTMLInputElement>document.getElementById("evi_name")).value =
      client.evidences[evidence].name;
    (<HTMLInputElement>document.getElementById("evi_desc")).value =
      client.evidences[evidence].desc;

    // Update icon
    const icon_id = getIndexFromSelect(
      "evi_select",
      client.evidences[evidence].filename,
    );
    (<HTMLSelectElement>document.getElementById("evi_select")).selectedIndex =
      icon_id;
    if (icon_id === 0) {
      (<HTMLInputElement>document.getElementById("evi_filename")).value =
        client.evidences[evidence].filename;
    }
    updateEvidenceIcon();

    // Update button
    document.getElementById("evi_add")!.className =
      "client_button hover_button inactive";
    document.getElementById("evi_edit")!.className =
      "client_button hover_button";
    document.getElementById("evi_cancel")!.className =
      "client_button hover_button";
    document.getElementById("evi_del")!.className =
      "client_button hover_button";
  } else {
    cancelEvidence();
  }
}

import { AO_HOST } from "../client/aoHost";
import { safeHtmlTags } from "../escaping";
import type * as aolib from "../aolib";

/**
 * EI: server pushes one evidence item during the streaming download.
 * Acks by requesting the next item (`AE`).
 */
export function applyEvidenceInfo(packet: aolib.EIPacket) {
  const d = packet.details;
  document.getElementById("client_loadingtext")!.innerHTML =
    `Loading Evidence ${packet.id}/${client.evidence_list_length}`;
  client.evidences[packet.id] = {
    name: safeHtmlTags(d.name),
    desc: safeHtmlTags(d.description),
    filename: d.image,
    icon: `${AO_HOST}evidence/${encodeURI(d.image.toLowerCase())}`,
  };
  client.server.send.AE({ id: packet.id + 1 });
}

/** LE: server pushes the full evidence list (replaces local cache). */
export function applyEvidenceList(packet: aolib.LEPacket) {
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
}
