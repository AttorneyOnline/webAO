import { client } from "../../client";
import { getCharIcon } from "../../client/handleCharacterInfo";
import { updatePlayerAreas } from "../../dom/updatePlayerAreas";

/**
 * Handles a playerlist update
 * @param {Array} args packet arguments
 */
export const handlePU = (args: string[]) => {
  const playerRow = <HTMLTableElement>(
    document.getElementById(`client_playerlist_entry${Number(args[1])}`)
  );
  const type = Number(args[2]);
  const data = args[3];
  switch (type) {
    case 0:
      const oocName = <HTMLElement>playerRow.childNodes[3];
      oocName.innerText = data;
      break;
    case 1:
      const playerImg = <HTMLImageElement>playerRow.childNodes[0].firstChild;
      getCharIcon(playerImg, data);
      const charName = <HTMLElement>playerRow.childNodes[1];
      charName.innerText = `[${args[1]}] ${data}`;
      break;
    case 2:
      const showName = <HTMLElement>playerRow.childNodes[2];
      showName.innerText = data;
      break;
    case 3:
      playerRow.className = `area${data}`;
      updatePlayerAreas(client.area);
    default:
      break;
  }
};
