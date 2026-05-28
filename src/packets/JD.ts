import type { PacketCodec } from "../packets";

export interface JDPacket {
  state: number;
}

export const JD: PacketCodec<JDPacket> = {
  header: "JD",
  decode(args) {
    return { state: Number(args[1]) };
  },
  encode(packet) {
    return `JD#${packet.state}#%`;
  },
};

/**
 * show/hide judge controls
 */
export const receiveJD = (packet: JDPacket) => {
  if (packet.state === 1) {
    document.getElementById("judge_action")!.style.display = "inline-table";
    document.getElementById("no_action")!.style.display = "none";
  } else {
    document.getElementById("judge_action")!.style.display = "none";
    document.getElementById("no_action")!.style.display = "inline-table";
  }
};
