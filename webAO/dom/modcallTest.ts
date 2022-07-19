import { handleZZ } from "../client/packetHandler/handleZZ";

/**
 * Triggered by the modcall sfx dropdown
 */
export function modcall_test() {
  handleZZ("test#test".split("#"));
}
window.modcall_test = modcall_test;
