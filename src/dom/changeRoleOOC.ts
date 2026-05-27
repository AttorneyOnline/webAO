import { updateActionCommands } from "./updateActionCommands";
import { client } from "../client";
import { sendCT } from "../packets/CT";
import { parseSide } from "../packets/MS";
/**
 * Change role via OOC.
 */
export function changeRoleOOC() {
  const roleselect = <HTMLInputElement>document.getElementById("role_select");

  const name = (<HTMLInputElement>document.getElementById("OOC_name")).value;
  sendCT({ name, message: `/pos ${roleselect.value}` });
  client.sendToServer(`SP#${roleselect.value}#%`);
  updateActionCommands(parseSide(roleselect.value));
}
window.changeRoleOOC = changeRoleOOC;
