import { client } from "../client.js";

/**
 * Decrement prosecution health point.
 */
export function redHPP() {
    client.sender.sendHP(2, client.hp[1] - 1);
}
window.redHPP = redHPP;