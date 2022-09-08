import { client } from "../client";

/**
 * Declare cross examination.
 */
export function initCE() {
    client.sendRT("testimony2");
}
window.initCE = initCE;