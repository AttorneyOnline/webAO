import { client } from "../client";
import { handleBans } from "../client/handleBans";
import * as aolib from "../aolib";

/** Kicked (no ban). Show the kick screen; reconnect still allowed. */
export function showKickScreen(packet: aolib.Out<typeof aolib.KK>) {
  client.banned = true;
  handleBans("Kicked", packet.reason);
}
