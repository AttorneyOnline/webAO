/**
 * Update evidence icon.
 */
export function updateEvidenceIcon() {
  const evidence_select = <HTMLSelectElement>(
    document.getElementById("evi_select")
  );
  const evidence_filename = <HTMLInputElement>(
    document.getElementById("evi_filename")
  );
  const evidence_iconbox = <HTMLImageElement>(
    document.getElementById("evi_preview")
  );

  if (evidence_select.selectedIndex === 0) {
    evidence_filename.style.display = "initial";
    evidence_iconbox.src = `${AO_HOST}evidence/${encodeURI(
      evidence_filename.value.toLowerCase()
    )}`;
  } else {
    evidence_filename.style.display = "none";
    evidence_iconbox.src = `${AO_HOST}evidence/${encodeURI(
      evidence_select.value.toLowerCase()
    )}`;
  }
}
window.updateEvidenceIcon = updateEvidenceIcon;
