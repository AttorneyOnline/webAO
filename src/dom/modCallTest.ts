import { receiveZZ } from "../packets/ZZ";
/**
 * Triggered by the modcall sfx dropdown
 */
export function modcall_test() {
  receiveZZ({ reason: "test" });
}
