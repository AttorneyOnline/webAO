import { showModcallNotice } from "../packets/ZZ";

/** Triggered by the modcall sfx dropdown — preview the modcall alert. */
export function modcall_test() {
  showModcallNotice({ reason: "test", target: -1 });
}
