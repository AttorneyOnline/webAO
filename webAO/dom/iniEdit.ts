/**
 * Triggered by the ini button.
 */
export async function iniedit() {
  const ininame = (<HTMLInputElement>document.getElementById("client_ininame"))
    .value;
  const inicharID = client.charID;
  await client.handleCharacterInfo(ininame.split("&"), inicharID);
  client.handlePV(`PV#0#CID#${inicharID}`.split("#"));
}
window.iniedit = iniedit;
