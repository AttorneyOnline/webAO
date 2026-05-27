import { sendCT } from "../packets/CT";
/**
 * Random character via OOC.
 */
export function randomCharacterOOC() {
  const name = (<HTMLInputElement>document.getElementById("OOC_name")).value;
  sendCT({ name, message: `/randomchar` });
}
window.randomCharacterOOC = randomCharacterOOC;
