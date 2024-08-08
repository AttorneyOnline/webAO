import { client, } from "../client";
import { updateEvidenceIcon } from './updateEvidenceIcon'
import { AO_HOST } from "../client/aoHost";


/**
 * Cancel evidence selection.
 */
export function cancelEvidence() {
    // Clear evidence data
    if (client.selectedEvidence >= 0) {
        document.getElementById(`evi_${client.selectedEvidence}`)!.className =
            "evi_icon";
    }
    client.selectedEvidence = -1;

    // Clear evidence on information window
    (<HTMLSelectElement>document.getElementById("evi_select")).selectedIndex = 0;
    updateEvidenceIcon(); // Update icon widget
    (<HTMLInputElement>document.getElementById("evi_filename")).value = "";
    (<HTMLInputElement>document.getElementById("evi_name")).value = "";
    (<HTMLInputElement>document.getElementById("evi_desc")).value = "";
    (<HTMLImageElement>(
        document.getElementById("evi_preview")
    )).src = `${AO_HOST}misc/empty.png`; // Clear icon

    // Update button
    document.getElementById("evi_add")!.className = "client_button hover_button";
    document.getElementById("evi_edit")!.className =
        "client_button hover_button inactive";
    document.getElementById("evi_cancel")!.className =
        "client_button hover_button inactive";
    document.getElementById("evi_del")!.className =
        "client_button hover_button inactive";
}
window.cancelEvidence = cancelEvidence;