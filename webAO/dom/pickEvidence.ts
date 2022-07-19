import { evidences, selectedEvidence, setSelectedEvidence } from "../client";
import { cancelEvidence } from "./cancelEvidence";
import { getIndexFromSelect } from "./getIndexFromSelect";
import { updateEvidenceIcon } from "./updateEvidenceIcon";

/**
 * Highlights and selects an evidence for in-character chat.
 * @param {string} evidence the evidence to be presented
 */
export function pickEvidence(evidence: number) {
  if (selectedEvidence !== evidence) {
    // Update selected evidence
    if (selectedEvidence > 0) {
      document.getElementById(`evi_${selectedEvidence}`)!.className =
        "evi_icon";
    }
    document.getElementById(`evi_${evidence}`)!.className = "evi_icon dark";
    setSelectedEvidence(evidence);

    // Show evidence on information window
    (<HTMLInputElement>document.getElementById("evi_name")).value =
      evidences[evidence - 1].name;
    (<HTMLInputElement>document.getElementById("evi_desc")).value =
      evidences[evidence - 1].desc;

    // Update icon
    const icon_id = getIndexFromSelect(
      "evi_select",
      evidences[evidence - 1].filename
    );
    (<HTMLSelectElement>document.getElementById("evi_select")).selectedIndex =
      icon_id;
    if (icon_id === 0) {
      (<HTMLInputElement>document.getElementById("evi_filename")).value =
        evidences[evidence - 1].filename;
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
