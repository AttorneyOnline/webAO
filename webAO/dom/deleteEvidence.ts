import { client } from "../client.js";
import { cancelEvidence } from "./cancelEvidence.js";

/**
 * Delete selected evidence.
 */
export function deleteEvidence() {
    const id = client.selectedEvidence - 1;
    client.sender.sendDE(id);
    cancelEvidence();
}
window.deleteEvidence = deleteEvidence;