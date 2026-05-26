import { client } from "../client";
import { cancelEvidence } from "./cancelEvidence";

/**
 * Add evidence.
 */
export function addEvidence() {
  const evidence_select = <HTMLSelectElement>(
    document.getElementById("evi_select")
  );
  client.sender.sendPE(
    (<HTMLInputElement>document.getElementById("evi_name")).value,
    (<HTMLInputElement>document.getElementById("evi_desc")).value,
    evidence_select.selectedIndex === 0
      ? (<HTMLInputElement>document.getElementById("evi_filename")).value
      : evidence_select.options[evidence_select.selectedIndex].text,
  );
  cancelEvidence();
}
window.addEvidence = addEvidence;
