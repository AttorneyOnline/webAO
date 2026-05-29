import { showModcallNotice } from "./oocLog";

/** Triggered by the modcall sfx dropdown — preview the modcall alert. */
export function modcall_test() {
  showModcallNotice({ reason: "test", target: -1 });
}
