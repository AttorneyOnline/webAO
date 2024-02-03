import { client } from "../client.js";

/**
 * Declare cross examination.
 */
export function initCE() {
    client.sender.sendRT("testimony2");
}
window.initCE = initCE;