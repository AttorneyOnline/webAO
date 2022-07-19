/**
 * Increment defense health point.
 */
export function addHPD() {
  client.sendHP(1, client.hp[0] + 1);
}
window.addHPD = addHPD;
