/**
 * Decrement prosecution health point.
 */
export function redHPP() {
  client.sendHP(2, client.hp[1] - 1);
}
window.redHPP = redHPP;
