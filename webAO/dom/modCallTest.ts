import { packetHandler } from "../packets/packetHandler.js";
/**
 * Triggered by the modcall sfx dropdown
 */
export function modcall_test() {
    packetHandler.get("ZZ")!("test#test".split("#"));
}
window.modcall_test = modcall_test;