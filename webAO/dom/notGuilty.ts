import { client } from "../client";
/**
 * Declare the defendant not guilty
 */
export function notguilty() {
  client.sendRT("judgeruling#0");
}
window.notguilty = notguilty;
