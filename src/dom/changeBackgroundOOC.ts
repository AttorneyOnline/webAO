import queryParser from "../utils/queryParser";
import { client } from "../client";
import { sendCT } from "../packets/CT";
const { mode } = queryParser();

/**
 * Change background via OOC.
 */
export function changeBackgroundOOC() {
  const selectedBG = <HTMLSelectElement>document.getElementById("bg_select");
  const changeBGCommand = "bg $1";
  const bgFilename = <HTMLInputElement>document.getElementById("bg_filename");

  let filename = "";
  if (selectedBG.selectedIndex === 0) {
    filename = bgFilename.value;
  } else {
    filename = selectedBG.value;
  }

  if (mode === "join") {
    const name = (<HTMLInputElement>document.getElementById("OOC_name")).value;
    sendCT({
      name,
      message: `/${changeBGCommand.replace("$1", filename)}`,
    });
  } else if (mode === "replay") {
    client.sendToSelf(`BN#${filename}#%`);
  }
}
window.changeBackgroundOOC = changeBackgroundOOC;
