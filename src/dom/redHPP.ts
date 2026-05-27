import { client } from "../client";
import { sendHP } from "../packets/HP";

/**
 * Decrement prosecution health point.
 */
export function redHPP() {
  sendHP({ bar: 2, value: client.hp[1] - 1 });
}
window.redHPP = redHPP;
