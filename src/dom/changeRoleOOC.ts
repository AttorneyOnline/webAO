import { updateActionCommands } from "./updateActionCommands";
import { client } from "../client";
/**
 * Change role via OOC.
 */
export function changeRoleOOC() {
  const roleselect = <HTMLInputElement>document.getElementById("role_select");

  client.sender.sendOOC(`/pos ${roleselect.value}`);
  client.sender.sendServer(`SP#${roleselect.value}#%`);
  updateActionCommands(roleselect.value);
}
window.changeRoleOOC = changeRoleOOC;
