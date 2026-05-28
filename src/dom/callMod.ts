import { extrafeatures } from "../client";
import { sendZZ } from "../packets/ZZ";
/**
 * Call mod.
 */
export function callMod() {
  let modcall;
  if (extrafeatures.includes("modcall_reason")) {
    modcall = prompt("Please enter the reason for the modcall", "");
  }
  if (modcall == null || modcall === "") {
    // cancel
  } else {
    sendZZ({ reason: modcall, target: -1 });
  }
}
