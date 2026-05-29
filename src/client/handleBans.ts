import { client } from "../client";
import { safeHtmlTags } from "../escaping";
import type * as aolib from "../aolib";

/**
 * Handles the kicked packet
 * @param {string} type is it a kick or a ban
 * @param {string} reason why
 */
export const handleBans = (type: string, reason: string) => {
  document.getElementById("client_error_overlay")!.style.display = "flex";
  document.getElementById("client_errortext")!.innerHTML =
    `${type}:<br>${safeHtmlTags(reason).replace(/\n/g, "<br />")}`;
  (<HTMLElement>document.getElementById("client_reconnect")).style.display =
    "none";
  (<HTMLElement>document.getElementById("client_error_help")).style.display =
    "none";
};

/** BB: server pops a blocking warning the user must dismiss. */
export const showBlockingAlert = (packet: aolib.Out<typeof aolib.BB>) => {
  alert(packet.message);
};

/** BD: server rejects the connection with a persistent ban reason. */
export const showBanDialog = (packet: aolib.Out<typeof aolib.BD>) => {
  client.banned = true;
  handleBans("Banned", packet.reason);
};

/** KB: kicked AND banned (reconnect refused). */
export const showKickAndBanScreen = (packet: aolib.Out<typeof aolib.KB>) => {
  client.banned = true;
  handleBans("Banned", packet.reason);
};

/** KK: kicked (no ban); reconnect still allowed. */
export const showKickScreen = (packet: aolib.Out<typeof aolib.KK>) => {
  client.banned = true;
  handleBans("Kicked", packet.reason);
};
