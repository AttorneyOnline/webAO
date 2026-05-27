import { sendRT } from "../packets/RT";

/**
 * Declare cross examination.
 */
export function initCE() {
  sendRT({ animation: "testimony2" });
}
window.initCE = initCE;
