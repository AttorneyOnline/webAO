import { updateActionCommands } from "./updateActionCommands";
import { client } from "../client";
import * as aolib from "../aolib";

const KNOWN_SIDES = new Set<string>(Object.values(aolib.Side));
const parseSide = (s: string): aolib.Side =>
  KNOWN_SIDES.has(s.toLowerCase())
    ? (s.toLowerCase() as aolib.Side)
    : aolib.Side.WITNESS;

/** Change role via OOC slash command. */
export function changeRoleOOC() {
  const roleselect = <HTMLInputElement>document.getElementById("role_select");
  const name = (<HTMLInputElement>document.getElementById("OOC_name")).value;
  const side = parseSide(roleselect.value);
  client.server.send.CT({ name, message: `/pos ${roleselect.value}` });
  // SP is a server -> client packet; locally apply the side change instead
  // of trying to send it (the server's broadcast will confirm).
  updateActionCommands(side);
}
