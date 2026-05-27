import { setAOhost } from "../../client/aoHost";
import { renderPlayerList } from "../../dom/renderPlayerList";
import type { ASSPacket } from "../types/ASS";

/**
 * new asset url!!
 */
export const handleASS = (packet: ASSPacket) => {
  if (packet.assetUrl !== "None") setAOhost(packet.assetUrl);
  renderPlayerList();
};
