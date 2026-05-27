import { sendRT } from "../packets/RT";

/**
 * Declare the defendant not guilty
 */
export function notguilty() {
  sendRT({ animation: "judgeruling", judgeId: 0 });
}
window.notguilty = notguilty;
