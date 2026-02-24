import { client } from "../../client";
import { ensureCharIni } from "../../client/handleCharacterInfo";
import { renderPlayerList } from "../../dom/renderPlayerList";

/**
 * Handles a playerlist update
 * @param {Array} args packet arguments
 */
export const handlePU = (args: string[]) => {
  const playerID = Number(args[1]);
  const player = client.playerlist.get(playerID);
  if (!player) return;

  const type = Number(args[2]);
  const data = args[3];

  switch (type) {
    case 0:
      player.name = data;
      break;
    case 1:
      player.charName = data;
      const charId = client.chars.findIndex(
        (c) => c && c.name.toLowerCase() === data.toLowerCase()
      );
      if (charId >= 0) {
        player.charId = charId;
        ensureCharIni(charId);
      }
      break;
    case 2:
      player.showName = data;
      break;
    case 3:
      player.area = Number(data);
      break;
    default:
      break;
  }

  renderPlayerList();
};
