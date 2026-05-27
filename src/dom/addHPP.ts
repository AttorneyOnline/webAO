import { client } from "../client";
import { sendHP } from "../packets/HP";

/**
 * Increment prosecution health point.
 */
export function addHPP() {
  sendHP({ bar: 2, value: client.hp[1] + 1 });
}
window.addHPP = addHPP;
