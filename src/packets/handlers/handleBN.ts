import { client } from "../../client";
import { safeTags } from "../../encoding";
import { updateBackgroundPreview } from "../../dom/updateBackgroundPreview";
import { getIndexFromSelect } from "../../dom/getIndexFromSelect";
import { switchPanTilt } from "../../dom/switchPanTilt";
import transparentPng from "../../constants/transparentPng";
import { setBackgroundImage } from "../../viewport/utils/setSide"
import type { BNPacket } from "../types/BN";

/**
 * Handles a background change.
 */

export const handleBN = (packet: BNPacket) => {
  const bgFromArgs = safeTags(packet.background);
  client.viewport.setBackgroundName(bgFromArgs);
  const bg_index = getIndexFromSelect(
    "bg_select",
    client.viewport.getBackgroundName(),
  );
  (<HTMLSelectElement>document.getElementById("bg_select")).selectedIndex =
    bg_index;
  updateBackgroundPreview();
  if (bg_index === 0) {
    (<HTMLInputElement>document.getElementById("bg_filename")).value =
      client.viewport.getBackgroundName();
  }


  setBackgroundImage("bg_preview",packet.background,"defenseempty")

  setBackgroundImage("client_def_bench",packet.background,"defensedesk")
  setBackgroundImage("client_wit_bench",packet.background,"stand")
  setBackgroundImage("client_pro_bench",packet.background,"prosecutiondesk")

  setBackgroundImage("client_court_def",packet.background,"defenseempty")
  setBackgroundImage("client_court_wit",packet.background,"witnessempty")
  setBackgroundImage("client_court_pro",packet.background,"prosecutorempty")

  setBackgroundImage("client_court_deft",packet.background,"transition_def")
  setBackgroundImage("client_court_prot",packet.background,"transition_pro")

  setBackgroundImage("client_court",packet.background,"court")

  if((<HTMLImageElement>document.getElementById("client_court")).src !== transparentPng) {
    const pantiltCheckbox = <HTMLInputElement>document.getElementById("client_pantilt");
    if (pantiltCheckbox.checked) {
      switchPanTilt();
    }
  }

  if (client.charID === -1) {
    client.viewport.set_side({
      position: "jud",
      showSpeedLines: false,
      showDesk: true,
    });
  } else {
    client.viewport.set_side({
      position: client.chars[client.charID].side,
      showSpeedLines: false,
      showDesk: true,
    });
  }
};
