import { client } from "../client.js";

/**
 * Increment defense health point.
 */
export function addHPD() {
    client.sender.sendHP(1, client.hp[0] + 1);
}
window.addHPD = addHPD;