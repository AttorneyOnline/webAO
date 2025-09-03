import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { safeTags } from "../../encoding";
import { updateBackgroundPreview } from "../../dom/updateBackgroundPreview";
import { getIndexFromSelect } from "../../dom/getIndexFromSelect";
import { switchPanTilt } from "../../dom/switchPanTilt";
import transparentPng from "../../constants/transparentPng";
import tryBackgroundUrls from "../../utils/tryBackgroundUrls";

/**
 * Handles a background change.
 * @param {Array} args packet arguments
 */

export const handleBN = (args: string[]) => {
  const bgFromArgs = safeTags(args[1]);
  client.viewport.setBackgroundName(bgFromArgs);
  const bgfolder = client.viewport.getBackgroundFolder();
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

  tryBackgroundUrls(
    `${AO_HOST}background/${encodeURI(args[1].toLowerCase())}/defenseempty`,
  ).then((resp) => {
    (<HTMLImageElement>document.getElementById("bg_preview")).src = resp;
  });
  tryBackgroundUrls(`${bgfolder}defensedesk`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_def_bench")).src = resp;
  });
  tryBackgroundUrls(`${bgfolder}stand`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_wit_bench")).src = resp;
  });
  tryBackgroundUrls(`${bgfolder}prosecutiondesk`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_pro_bench")).src = resp;
  });
  tryBackgroundUrls(`${bgfolder}court`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court")).src = resp;
    if (resp !== transparentPng) {
      (<HTMLInputElement>document.getElementById("client_pantilt")).checked =
        true;
      switchPanTilt();
    }
  });
  tryBackgroundUrls(`${bgfolder}defenseempty`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court_def")).src = resp;
  });
  tryBackgroundUrls(`${bgfolder}transition_def`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court_deft")).src = resp;
  });
  tryBackgroundUrls(`${bgfolder}witnessempty`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court_wit")).src = resp;
  });
  tryBackgroundUrls(`${bgfolder}transition_pro`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court_prot")).src = resp;
  });
  tryBackgroundUrls(`${bgfolder}prosecutorempty`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court_pro")).src = resp;
  });

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
