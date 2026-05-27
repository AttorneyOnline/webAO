import { client } from "../client";

/**
 * Increment prosecution health point.
 */
export function addHPP() {
  client.sender.sendHP({ bar: 2, value: client.hp[1] + 1 });
}
window.addHPP = addHPP;
