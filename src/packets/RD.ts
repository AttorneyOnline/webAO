import { client } from "../client";
import type { PacketCodec } from "../packets";

export type RDPacket = Record<string, never>;

export const RD: PacketCodec<RDPacket> = {
  header: "RD",
  decode() {
    return {};
  },
  encode() {
    return `RD#%`;
  },
};

/**
 * we are asking ourselves what characters there are
 */
export const receiveRD = (_packet: RDPacket) => {
  client.receiveData("BN#gs4#%");
  client.receiveData("DONE#%");
  const ooclog = <HTMLInputElement>document.getElementById("client_ooclog");
  ooclog.value = "";
  ooclog.readOnly = false;

  document.getElementById("client_oocinput")!.style.display = "none";
  document.getElementById("client_replaycontrols")!.style.display =
    "inline-block";
};
