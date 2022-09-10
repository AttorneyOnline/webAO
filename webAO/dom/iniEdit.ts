import { client } from "../client";
import { handleCharacterInfo } from "../client/handleCharacterInfo";
import { packetHandler } from "../packets/packetHandler";

/**
 * Triggered by the ini button.
 */
export async function iniedit() {
    const ininame = (<HTMLInputElement>document.getElementById("client_ininame"))
        .value;
    const inicharID = client.charID;
    await handleCharacterInfo(ininame.split("&"), inicharID);
    packetHandler.get("PV")!(`PV#0#CID#${inicharID}`.split("#"));
}
window.iniedit = iniedit;
