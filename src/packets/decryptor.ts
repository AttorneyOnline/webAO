import { client } from "../client";
import * as aolib from "../aolib";

/**
 * Obsolete FantaCrypt initialization marker. Modern servers advertise
 * `noencryption` in `FL` and never send this in its original role.
 *
 * Repurposed as a handshake trigger: arrival means the server is ready
 * for our `HI`. aolib already auto-flips the session into JSON mode
 * when this packet's `value === "JSON"`, so we just kick off the join.
 */
export function applyEncryptionMode() {
  client.joinServer();
}
