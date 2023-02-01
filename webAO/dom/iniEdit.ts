import { client } from "../client";
import { handleCharacterInfo } from "../client/handleCharacterInfo";
import { packetHandler } from "../packets/packetHandler";

/**
 * Triggered by the ini button.
 */
export async function iniedit() {
    const iniselect = (<HTMLSelectElement>document.getElementById("client_iniselect"))
    const ininame = (<HTMLInputElement>document.getElementById("client_ininame"));
    const inicharID = client.charID;

    const newname = iniselect.selectedIndex === 0 ? ininame.value : iniselect.value;

    await handleCharacterInfo(newname.split("&"), inicharID);
    packetHandler.get("PV")!(`PV#0#CID#${inicharID}`.split("#"));
}
window.iniedit = iniedit;
