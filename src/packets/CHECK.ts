import * as aolib from "../aolib";

/**
 * Keepalive ack. Empty payload, no client-side action — just keeps
 * the connection from idling.
 */
export function onServerKeepalive() {
  // no-op
}
