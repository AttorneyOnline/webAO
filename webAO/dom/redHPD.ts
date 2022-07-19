import { client } from "../client";
/**
 * Decrement defense health point.
 */
export function redHPD() {
  client.sendHP(1, client.hp[0] - 1);
}
window.redHPD = redHPD;
