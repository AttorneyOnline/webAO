import { client } from "../../client";
import type { RDPacket } from "../types/RD";

/**
 * we are asking ourselves what characters there are
 */
export const handleRD = (_packet: RDPacket) => {
  client.sender.sendSelf("BN#gs4#%");
  client.sender.sendSelf("DONE#%");
  const ooclog = <HTMLInputElement>document.getElementById("client_ooclog");
  ooclog.value = "";
  ooclog.readOnly = false;

  document.getElementById("client_oocinput")!.style.display = "none";
  document.getElementById("client_replaycontrols")!.style.display =
    "inline-block";
};
