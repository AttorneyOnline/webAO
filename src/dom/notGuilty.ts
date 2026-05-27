import { client } from "../client";

/**
 * Declare the defendant not guilty
 */
export function notguilty() {
  client.sender.sendRT({ animation: "judgeruling", judgeId: 0 });
}
window.notguilty = notguilty;
