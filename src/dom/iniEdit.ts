import { client } from "../client";
import { handleCharacterInfo } from "../client/handleCharacterInfo";
import { receivePV } from "../packets/PV";

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
  receivePV({ player_id: 0, char_id: inicharID });
}
