import { setAOhost } from "../client/aoHost";
import { renderPlayerList } from "../dom/renderPlayerList";
import * as aolib from "../aolib";

/**
 * Apply the new asset origin. `"None"` is a sentinel meaning "keep the
 * current host"; any other value replaces it.
 */
export function applyAssetOrigin(packet: aolib.Out<typeof aolib.ASS>) {
  if (packet.asset_url !== "None") setAOhost(packet.asset_url);
  renderPlayerList();
}
