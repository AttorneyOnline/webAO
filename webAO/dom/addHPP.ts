import { client } from "../client.js";

/**
 * Increment prosecution health point.
 */
export function addHPP() {
    client.sender.sendHP(2, client.hp[1] + 1);
}
window.addHPP = addHPP;