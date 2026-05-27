import { client } from "../client";

/**
 * Pair with a player on both supported pathways at once:
 *  1. Server-side OOC command `/pair <playerID>` (used by servers that
 *     implement bidirectional pairing announcements).
 *  2. Local `#pair_select` dropdown (the canonical AO `paired_charid`
 *     route — embedded in the next outgoing IC message). This works on
 *     any vanilla AO server even when the OOC command is unknown.
 */
export function pairPlayer(id: number) {
  const name = (<HTMLInputElement>document.getElementById("OOC_name")).value;
  client.sender.sendCT({ name, message: `/pair ${id}` });

  const target = client.playerlist?.get(id);
  if (target && Number.isInteger(target.charId) && target.charId >= 0) {
    const pairSelect = document.getElementById("pair_select") as HTMLSelectElement | null;
    if (pairSelect) {
      const charIdStr = String(target.charId);
      const hasOption = Array.from(pairSelect.options).some(
        (opt) => opt.value === charIdStr,
      );
      if (hasOption) {
        pairSelect.value = charIdStr;
        pairSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  }
}
window.pairPlayer = pairPlayer;
