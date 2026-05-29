import { client } from "../client";
import { handleBans } from "../client/handleBans";
import * as aolib from "../aolib";

/** Kicked-and-banned. Persistent ban; show the ban screen. */
export function showKickAndBanScreen(packet: aolib.Out<typeof aolib.KB>) {
  client.banned = true;
  handleBans("Banned", packet.reason);
}
