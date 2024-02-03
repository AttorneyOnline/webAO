import { client } from '../client.js'
/**
 * Random character via OOC.
 */
export function randomCharacterOOC() {
    client.sender.sendOOC(`/randomchar`);
}
window.randomCharacterOOC = randomCharacterOOC;