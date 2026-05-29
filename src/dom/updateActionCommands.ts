import { Side } from "../aolib";
import type * as aolib from "../aolib";

/** Sync the judge-action UI and the role-select dropdown for a side. */
export function updateActionCommands(side: Side) {
  if (side === Side.JUDGE) {
    document.getElementById("judge_action")!.style.display = "inline-table";
    document.getElementById("no_action")!.style.display = "none";
  } else {
    document.getElementById("judge_action")!.style.display = "none";
    document.getElementById("no_action")!.style.display = "inline-table";
  }

  // Update role selector
  for (
    let i = 0,
      role_select = <HTMLSelectElement>document.getElementById("role_select");
    i < role_select.options.length;
    i++
  ) {
    if (side === role_select.options[i].value) {
      role_select.options.selectedIndex = i;
      return;
    }
  }
}

/** SP: server confirms a position change for the local character. */
export function applyCharacterSide(packet: aolib.SPPacket) {
  updateActionCommands(packet.side);
}

/** JD: toggle the judge-action panel (`state === 1` shows, else hides). */
export function toggleJudgePanel(packet: aolib.JDPacket) {
  if (packet.state === 1) {
    document.getElementById("judge_action")!.style.display = "inline-table";
    document.getElementById("no_action")!.style.display = "none";
  } else {
    document.getElementById("judge_action")!.style.display = "none";
    document.getElementById("no_action")!.style.display = "inline-table";
  }
}
