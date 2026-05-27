import { client } from "../client";
import { cancelEvidence } from "./cancelEvidence";

/**
 * Edit selected evidence.
 */
export function editEvidence() {
  const evidence_select = <HTMLSelectElement>(
    document.getElementById("evi_select")
  );
  const id = client.selectedEvidence;
  client.sender.sendEE({
    id,
    name: (<HTMLInputElement>document.getElementById("evi_name")).value,
    desc: (<HTMLInputElement>document.getElementById("evi_desc")).value,
    img:
      evidence_select.selectedIndex === 0
        ? (<HTMLInputElement>document.getElementById("evi_filename")).value
        : evidence_select.options[evidence_select.selectedIndex].text,
  });
  cancelEvidence();
}
window.editEvidence = editEvidence;
