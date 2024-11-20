import { client } from "../client";

/**
 * Declare cross examination.
 */
export function initCE() {
  client.sender.sendRT("testimony2");
}
window.initCE = initCE;
