import { client } from "../../client";
import { updatePlayerAreas } from "../../dom/updatePlayerAreas";
import { AO_HOST } from "../../client/aoHost";
import { ensureCharIni } from "../../client/handleCharacterInfo";

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
      playerImg.alt = data;
      playerImg.title = data;
      const iconExt = client.charicon_extensions[0] || ".png";
      playerImg.src = `${AO_HOST}characters/${encodeURI(data.toLowerCase())}/char_icon${iconExt}`;
      const charName = <HTMLElement>playerRow.childNodes[1];
      charName.innerText = `[${args[1]}] ${data}`;
      const charId = client.chars.findIndex(
        (c: any) => c && c.name.toLowerCase() === data.toLowerCase()
      );
      if (charId >= 0) {
        const player = client.players.get(Number(args[1]));
        if (player) {
          player.charId = charId;
          if (player.area === client.area) {
            ensureCharIni(charId);
          }
        }
      }
      break;
    case 2:
      const showName = <HTMLElement>playerRow.childNodes[2];
      showName.innerText = data;
      break;
    case 3:
      playerRow.className = `area${data}`;
      updatePlayerAreas(client.area);
      const puPlayer = client.players.get(Number(args[1]));
      if (puPlayer) {
        puPlayer.area = Number(data);
        if (puPlayer.area === client.area && puPlayer.charId >= 0) {
          ensureCharIni(puPlayer.charId);
        }
      }
    default:
      break;
  }
};
