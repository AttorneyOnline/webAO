import { client } from "../client";
import * as aolib from "../aolib";

/**
 * Replay-mode synthesis: when the local client signals ready, feed
 * back BN (default background) and DONE as if a server had sent them,
 * then make the OOC log writable for the replay queue.
 */
export function onReady() {
  client.server.receive("BN#gs4#%");
  client.server.receive("DONE#%");
  const ooclog = <HTMLInputElement>document.getElementById("client_ooclog");
  ooclog.value = "";
  ooclog.readOnly = false;

  document.getElementById("client_oocinput")!.style.display = "none";
  document.getElementById("client_replaycontrols")!.style.display = "inline-block";
}
