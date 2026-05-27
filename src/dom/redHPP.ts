import { client } from "../client";

/**
 * Decrement prosecution health point.
 */
export function redHPP() {
  client.sender.sendHP({ bar: 2, value: client.hp[1] - 1 });
}
window.redHPP = redHPP;
