/**
 * Edit selected evidence.
 */
export function editEvidence() {
  const evidence_select = <HTMLSelectElement>(
    document.getElementById("evi_select")
  );
  const id = client.selectedEvidence - 1;
  client.sendEE(
    id,
    (<HTMLInputElement>document.getElementById("evi_name")).value,
    (<HTMLInputElement>document.getElementById("evi_desc")).value,
    evidence_select.selectedIndex === 0
      ? (<HTMLInputElement>document.getElementById("evi_filename")).value
      : evidence_select.options[evidence_select.selectedIndex].text
  );
  cancelEvidence();
}
window.editEvidence = editEvidence;
