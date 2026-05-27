import { updateActionCommands } from "./updateActionCommands";
import { client } from "../client";
import { parseSide } from "../packets/MS";
/**
 * Change role via OOC.
 */
export function changeRoleOOC() {
  const roleselect = <HTMLInputElement>document.getElementById("role_select");

  client.sender.sendOOC(`/pos ${roleselect.value}`);
  client.sender.sendServer(`SP#${roleselect.value}#%`);
  updateActionCommands(parseSide(roleselect.value));
}
window.changeRoleOOC = changeRoleOOC;
