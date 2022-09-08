import { client } from "../client";
import { cancelEvidence } from "./cancelEvidence";

/**
 * Delete selected evidence.
 */
export function deleteEvidence() {
    const id = client.selectedEvidence - 1;
    client.sendDE(id);
    cancelEvidence();
}
window.deleteEvidence = deleteEvidence;