import { client } from "../client";

/**
 * Increment defense health point.
 */
export function addHPD() {
  client.sender.sendHP({ bar: 1, value: client.hp[0] + 1 });
}
window.addHPD = addHPD;
