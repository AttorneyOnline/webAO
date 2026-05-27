import type { JDPacket } from "../types/JD";

/**
 * show/hide judge controls
 */
export const handleJD = (packet: JDPacket) => {
  if (packet.state === 1) {
    document.getElementById("judge_action")!.style.display = "inline-table";
    document.getElementById("no_action")!.style.display = "none";
  } else {
    document.getElementById("judge_action")!.style.display = "none";
    document.getElementById("no_action")!.style.display = "inline-table";
  }
};
