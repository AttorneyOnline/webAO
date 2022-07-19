/**
 * Triggered by the modcall sfx dropdown
 */
export function modcall_test() {
  client.handleZZ("test#test".split("#"));
}
window.modcall_test = modcall_test;
