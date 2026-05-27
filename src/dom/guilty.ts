import { sendRT } from "../packets/RT";

/**
 * Declare the defendant not guilty
 */
export function guilty() {
  sendRT({ animation: "judgeruling", judgeId: 1 });
}
window.guilty = guilty;
