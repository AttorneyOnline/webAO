/**
 * Delete selected evidence.
 */
export function deleteEvidence() {
  const id = client.selectedEvidence - 1;
  client.sendDE(id);
  cancelEvidence();
}
window.deleteEvidence = deleteEvidence;
