import { client } from "../client";
import { AO_HOST } from "../client/aoHost";

export function renderPlayerList() {
  const list = document.getElementById("client_playerlist") as HTMLTableElement;
  list.innerHTML = "";

  for (const [playerID, player] of client.playerlist) {
    const playerRow = list.insertRow();
    playerRow.id = `client_playerlist_entry${playerID}`;

    const imgCell = playerRow.insertCell(0);
    imgCell.style.width = "64px";
    const img = document.createElement("img");
    if (player.charId >= 0) {
      const char = client.chars[player.charId];
      if (char) {
        const iconExt = client.charicon_extensions[0] || ".png";
        img.src = `${AO_HOST}characters/${encodeURI(char.name.toLowerCase())}/char_icon${iconExt}`;
        img.alt = char.name;
        img.title = char.name;
      }
    }
    imgCell.appendChild(img);

    const charNameCell = playerRow.insertCell(1);
    charNameCell.textContent =
      player.charId >= 0 ? `[${playerID}] ${player.charName}` : "";

    const showNameCell = playerRow.insertCell(2);
    showNameCell.textContent = player.showName;

    const oocNameCell = playerRow.insertCell(3);
    oocNameCell.textContent = player.name;

    const kickCell = playerRow.insertCell(4);
    kickCell.style.width = "64px";
    const kick = document.createElement("button");
    kick.innerText = "Kick";
    kick.onclick = () => window.kickPlayer(playerID);
    kickCell.appendChild(kick);

    const banCell = playerRow.insertCell(5);
    banCell.style.width = "64px";
    const ban = document.createElement("button");
    ban.innerText = "Ban";
    ban.onclick = () => window.banPlayer(playerID);
    banCell.appendChild(ban);
  }
}
