import { client } from "../../client";
import { renderPlayerList } from "../../dom/renderPlayerList";
import type { PRPacket } from "../types/PR";

/**
 * Handles a player joining or leaving
 */
export const handlePR = (packet: PRPacket) => {
  if (packet.type === 0) {
    client.playerlist.set(packet.id, { charId: -1, charName: "", showName: "", name: "", area: 0 });
  } else if (packet.type === 1) {
    client.playerlist.delete(packet.id);
  }
  renderPlayerList();
};
