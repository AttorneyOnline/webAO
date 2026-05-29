import { client } from "../client";
import { extrafeatures } from "../client";
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
    client.server.send.ZZ({ reason: modcall, target: -1 });
  }
}
