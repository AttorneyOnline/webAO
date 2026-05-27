import { sendPE } from "../packets/PE";
import { cancelEvidence } from "./cancelEvidence";

/**
 * Add evidence.
 */
export function addEvidence() {
  const evidence_select = <HTMLSelectElement>(
    document.getElementById("evi_select")
  );
  sendPE({
    name: (<HTMLInputElement>document.getElementById("evi_name")).value,
    desc: (<HTMLInputElement>document.getElementById("evi_desc")).value,
    img:
      evidence_select.selectedIndex === 0
        ? (<HTMLInputElement>document.getElementById("evi_filename")).value
        : evidence_select.options[evidence_select.selectedIndex].text,
  });
  cancelEvidence();
}
window.addEvidence = addEvidence;
