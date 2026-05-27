import { handleZZ } from "../packets/handlers/handleZZ";
/**
 * Triggered by the modcall sfx dropdown
 */
export function modcall_test() {
  handleZZ({ reason: "test" });
}
window.modcall_test = modcall_test;
