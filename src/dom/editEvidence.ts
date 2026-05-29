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
  client.server.send.EE({
    id,
    name: (<HTMLInputElement>document.getElementById("evi_name")).value,
    description: (<HTMLInputElement>document.getElementById("evi_desc")).value,
    image:
      evidence_select.selectedIndex === 0
        ? (<HTMLInputElement>document.getElementById("evi_filename")).value
        : evidence_select.options[evidence_select.selectedIndex].text,
  });
  cancelEvidence();
}
