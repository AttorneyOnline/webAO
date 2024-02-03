import { client, extrafeatures } from "../client.js";
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
        client.sender.sendZZ(modcall);
    }
}
// @ts-ignore
window.callMod = callMod;
