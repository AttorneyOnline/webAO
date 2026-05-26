import { client } from "../client";

/**
 * Declare witness testimony.
 */
export function initWT() {
  client.sender.sendRT("testimony1");
}
window.initWT = initWT;
