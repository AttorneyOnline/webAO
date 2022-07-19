import { client } from "../client";
/**
 * Random character via OOC.
 */
export function randomCharacterOOC() {
  client.sendOOC(`/randomchar`);
}
window.randomCharacterOOC = randomCharacterOOC;
