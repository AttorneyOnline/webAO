import { client } from "../client";
import { cancelEvidence } from "./cancelEvidence";

/**
 * Delete selected evidence.
 */
export function deleteEvidence() {
    const id = client.selectedEvidence;
    client.sender.sendDE(id);
    cancelEvidence();
}
window.deleteEvidence = deleteEvidence;