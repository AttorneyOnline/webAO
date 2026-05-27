import { sendRT } from "../packets/RT";

/**
 * Declare witness testimony.
 */
export function initWT() {
  sendRT({ animation: "testimony1" });
}
window.initWT = initWT;
