import { updateActionCommands } from "./updateActionCommands";
import { client } from "../client";
import { sendCT } from "../packets/CT";
import { parseSide } from "../packets/MS";
import { SP } from "../packets/SP";
/**
 * Change role via OOC.
 */
export function changeRoleOOC() {
  const roleselect = <HTMLInputElement>document.getElementById("role_select");

  const name = (<HTMLInputElement>document.getElementById("OOC_name")).value;
  const side = parseSide(roleselect.value);
  sendCT({ name, message: `/pos ${roleselect.value}` });
  client.sendPacketToServer(SP, { side });
  updateActionCommands(side);
}
