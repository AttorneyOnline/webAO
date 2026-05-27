import { client } from "../client";
/**
 * Random character via OOC.
 */
export function randomCharacterOOC() {
  client.sender.sendCT(`/randomchar`);
}
window.randomCharacterOOC = randomCharacterOOC;
