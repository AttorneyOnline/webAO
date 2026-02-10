import { client } from "../client";
import { AO_HOST } from "../client/aoHost";

export function renderPlayerList() {
  const list = document.getElementById("client_playerlist") as HTMLTableElement;
  list.innerHTML = "";

  const header = list.createTHead().insertRow();
  for (const label of ["Icon", "Character", "Showname", "OOC Name"]) {
    const th = document.createElement("th");
    th.textContent = label;
    header.appendChild(th);
  }

  const body = list.createTBody();
  for (const [playerID, player] of client.playerlist) {
    const playerRow = body.insertRow();
    playerRow.id = `client_playerlist_entry${playerID}`;
    playerRow.style.display = player.area === client.area ? "" : "none";

    const imgCell = playerRow.insertCell(0);
    imgCell.style.width = "64px";
    const img = document.createElement("img");
    if (player.charName) {
      const iconExt = client.charicon_extensions[0] || ".png";
      img.src = `${AO_HOST}characters/${encodeURI(player.charName.toLowerCase())}/char_icon${iconExt}`;
      img.alt = player.charName;
      img.title = player.charName;
    }
    imgCell.appendChild(img);

    const charNameCell = playerRow.insertCell(1);
    charNameCell.textContent =
      player.charName ? `[${playerID}] ${player.charName}` : "";

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
