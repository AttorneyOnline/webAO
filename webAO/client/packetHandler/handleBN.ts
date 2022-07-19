import { AO_HOST, charID, chars } from "../../client";
import { getIndexFromSelect } from "../../dom/getIndexFromSelect";
import { updateBackgroundPreview } from "../../dom/updateBackgroundPreview";
import { safeTags } from "../../encoding";
import tryUrls from "../../utils/tryUrls";
import {
  backgroundFolder,
  backgroundName,
  setBackgroundName,
  set_side,
} from "../../viewport";

/**
 * Handles a background change.
 * @param {Array} args packet arguments
 */

export const handleBN = (args: string[]) => {
  const bgFromArgs = safeTags(args[1]);
  setBackgroundName(bgFromArgs);
  const bgfolder = backgroundFolder;
  const bg_index = getIndexFromSelect("bg_select", backgroundFolder);
  (<HTMLSelectElement>document.getElementById("bg_select")).selectedIndex =
    bg_index;
  updateBackgroundPreview();
  if (bg_index === 0) {
    (<HTMLInputElement>document.getElementById("bg_filename")).value =
      backgroundName;
  }

  tryUrls(
    `${AO_HOST}background/${encodeURI(args[1].toLowerCase())}/defenseempty`
  ).then((resp) => {
    (<HTMLImageElement>document.getElementById("bg_preview")).src = resp;
  });
  tryUrls(`${bgfolder}defensedesk`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_def_bench")).src = resp;
  });
  tryUrls(`${bgfolder}stand`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_wit_bench")).src = resp;
  });
  tryUrls(`${bgfolder}prosecutiondesk`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_pro_bench")).src = resp;
  });
  tryUrls(`${bgfolder}full`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court")).src = resp;
  });
  tryUrls(`${bgfolder}defenseempty`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court_def")).src = resp;
  });
  tryUrls(`${bgfolder}transition_def`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court_deft")).src = resp;
  });
  tryUrls(`${bgfolder}witnessempty`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court_wit")).src = resp;
  });
  tryUrls(`${bgfolder}transition_pro`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court_prot")).src = resp;
  });
  tryUrls(`${bgfolder}prosecutorempty`).then((resp) => {
    (<HTMLImageElement>document.getElementById("client_court_pro")).src = resp;
  });

  if (charID === -1) {
    set_side({
      position: "jud",
      showSpeedLines: false,
      showDesk: true,
    });
  } else {
    set_side({
      position: chars[charID].side,
      showSpeedLines: false,
      showDesk: true,
    });
  }
};
