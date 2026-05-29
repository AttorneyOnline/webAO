import { client } from "../client";
import { handleBans } from "../client/handleBans";
import * as aolib from "../aolib";

/** Ban-on-reconnect: mark the session banned and show the ban screen. */
export function showBanDialog(packet: aolib.Out<typeof aolib.BD>) {
  client.banned = true;
  handleBans("Banned", packet.reason);
}
