import { client } from "../client.js";

/**
 * Declare witness testimony.
 */
export function initWT() {
    client.sender.sendRT("testimony1");
}
window.initWT = initWT;