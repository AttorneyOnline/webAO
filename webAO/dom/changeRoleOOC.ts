/**
 * Change role via OOC.
 */
export function changeRoleOOC() {
  const roleselect = <HTMLInputElement>document.getElementById("role_select");

  client.sendOOC(`/pos ${roleselect.value}`);
  client.sendServer(`SP#${roleselect.value}#%`);
  updateActionCommands(roleselect.value);
}
window.changeRoleOOC = changeRoleOOC;
