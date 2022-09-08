import { client } from "../client";

/**
 * Increment prosecution health point.
 */
export function addHPP() {
    client.sendHP(2, client.hp[1] + 1);
}
window.addHPP = addHPP;