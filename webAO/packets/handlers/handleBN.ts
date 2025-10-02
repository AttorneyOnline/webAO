import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { safeTags } from "../../encoding";
import { updateBackgroundPreview } from "../../dom/updateBackgroundPreview";
import { getIndexFromSelect } from "../../dom/getIndexFromSelect";
import { switchPanTilt } from "../../dom/switchPanTilt";
import transparentPng from "../../constants/transparentPng";
import fileExists from "../../utils/fileExists";

async function setBackgroundImage(elementid: string, bgname: string, bgpart: string) {

  let url;
  let success = false;
  for (const extension of client.background_extensions) {
    url = `${AO_HOST}background/${encodeURI(bgname.toLowerCase())}/${bgpart}${extension}`;
    const exists = await fileExists(url);

    if (exists) {
      success = true;
      break;
    }
  }
  if (success)
    (<HTMLImageElement>document.getElementById(elementid)).src = url;
  else
    (<HTMLImageElement>document.getElementById(elementid)).src = transparentPng;
  return success;
}


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


  setBackgroundImage("bg_preview",args[1],"defenseempty")

  setBackgroundImage("client_def_bench",args[1],"defensedesk")
  setBackgroundImage("client_wit_bench",args[1],"stand")
  setBackgroundImage("client_pro_bench",args[1],"prosecutiondesk")

  setBackgroundImage("client_court_def",args[1],"defenseempty")
  setBackgroundImage("client_court_wit",args[1],"witnessempty")
  setBackgroundImage("client_court_pro",args[1],"prosecutorempty")

  setBackgroundImage("client_court_deft",args[1],"transition_def")
  setBackgroundImage("client_court_prot",args[1],"transition_pro")

  setBackgroundImage("client_court",args[1],"court")
  
  if((<HTMLImageElement>document.getElementById("client_court")).src !== transparentPng) {
    (<HTMLInputElement>document.getElementById("client_pantilt")).checked =
        true;
      switchPanTilt();
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
