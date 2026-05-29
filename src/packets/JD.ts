import * as aolib from "../aolib";

/**
 * Toggle the judge action panel. `state === 1` shows it; anything else
 * hides it.
 */
export function toggleJudgePanel(packet: aolib.Out<typeof aolib.JD>) {
  if (packet.state === 1) {
    document.getElementById("judge_action")!.style.display = "inline-table";
    document.getElementById("no_action")!.style.display = "none";
  } else {
    document.getElementById("judge_action")!.style.display = "none";
    document.getElementById("no_action")!.style.display = "inline-table";
  }
}
