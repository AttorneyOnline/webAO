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
window.pickEvidence = pickEvidence;
