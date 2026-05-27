import { client } from "../client";
import { sendHP } from "../packets/HP";

/**
 * Increment defense health point.
 */
export function addHPD() {
  sendHP({ bar: 1, value: client.hp[0] + 1 });
}
window.addHPD = addHPD;
