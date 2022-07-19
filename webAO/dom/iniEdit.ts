import { charID, handleCharacterInfo } from "../client";
import { handlePV } from "../client/packetHandler/handlePV";

/**
 * Triggered by the ini button.
 */
export async function iniedit() {
  const ininame = (<HTMLInputElement>document.getElementById("client_ininame"))
    .value;
  const inicharID = charID;
  await handleCharacterInfo(ininame.split("&"), inicharID);
  handlePV(`PV#0#CID#${inicharID}`.split("#"));
}
window.iniedit = iniedit;
