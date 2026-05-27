import { client } from "../client";

/**
 * Decrement defense health point.
 */
export function redHPD() {
  client.sender.sendHP({ bar: 1, value: client.hp[0] - 1 });
}
window.redHPD = redHPD;
