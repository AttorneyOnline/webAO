import { client } from "../../client";
import { renderPlayerList } from "../../dom/renderPlayerList";

/**
 * Handles a player joining or leaving
 * @param {Array} args packet arguments
 */
export const handlePR = (args: string[]) => {
  const playerID = Number(args[1]);
  if (Number(args[2]) === 0) {
    client.playerlist.set(playerID, { charId: -1, charName: "", showName: "", name: "", area: 0 });
  } else if (Number(args[2]) === 1) {
    client.playerlist.delete(playerID);
  }
  renderPlayerList();
};
