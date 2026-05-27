import { client } from "../client";
import { sendHP } from "../packets/HP";

/**
 * Decrement defense health point.
 */
export function redHPD() {
  sendHP({ bar: 1, value: client.hp[0] - 1 });
}
window.redHPD = redHPD;
