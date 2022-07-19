import { selectedEvidence } from "../client";
import { cancelEvidence } from "./cancelEvidence";
import { client } from "../client";

/**
 * Delete selected evidence.
 */
export function deleteEvidence() {
  const id = selectedEvidence - 1;
  client.sendDE(id);
  cancelEvidence();
}
window.deleteEvidence = deleteEvidence;
