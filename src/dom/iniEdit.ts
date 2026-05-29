import { client } from "../client";
import { changeChar } from "../client/changeChar";
import { handleCharacterInfo } from "../client/handleCharacterInfo";

/**
 * Triggered by the ini button.
 */
export async function iniedit() {
  const iniselect = <HTMLSelectElement>(
    document.getElementById("client_iniselect")
  );
  const ininame = <HTMLInputElement>document.getElementById("client_ininame");
  const inicharID = client.charID;

  const newname =
    iniselect.selectedIndex === 0 ? ininame.value : iniselect.value;

  await handleCharacterInfo(newname.split("&"), inicharID);
  await changeChar(inicharID);
}
