import { client } from "../client";
/**
 * Random character via OOC.
 */
export function randomCharacterOOC() {
  const name = (<HTMLInputElement>document.getElementById("OOC_name")).value;
  client.sender.sendCT({ name, message: `/randomchar` });
}
window.randomCharacterOOC = randomCharacterOOC;
