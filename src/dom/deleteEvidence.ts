import { client } from "../client";
import { sendDE } from "../packets/DE";
import { cancelEvidence } from "./cancelEvidence";

/**
 * Delete selected evidence.
 */
export function deleteEvidence() {
  const id = client.selectedEvidence;
  sendDE({ id });
  cancelEvidence();
}
window.deleteEvidence = deleteEvidence;
