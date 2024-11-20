import { client } from "../../client";
import { kickPlayer, banPlayer } from "../../dom/banPlayer";

function addPlayer(playerID: number) {
  const list = <HTMLTableElement>document.getElementById("client_playerlist");
  const playerRow = list.insertRow();
  playerRow.id = `client_playerlist_entry${playerID}`;
  playerRow.className = `area0`;

  const imgCell = playerRow.insertCell(0);
  imgCell.style.width = "64px";
  const img = document.createElement("img");
  imgCell.appendChild(img);

  const name = document.createTextNode("Unknown");

  const charNameCell = playerRow.insertCell(1);
  charNameCell.appendChild(name);
  const showNameCell = playerRow.insertCell(2);
  showNameCell.appendChild(name);
  const oocNameCell = playerRow.insertCell(3);
  oocNameCell.appendChild(name);

  const kickCell = playerRow.insertCell(4);
  kickCell.style.width = "64px";
  const kick = <HTMLButtonElement>document.createElement("button");
  kick.innerText = "Kick";
  kick.onclick = () => {
    window.kickPlayer(playerID);
  };
  kickCell.appendChild(kick);

  const banCell = playerRow.insertCell(5);
  banCell.style.width = "64px";
  const ban = <HTMLButtonElement>document.createElement("button");
  ban.innerText = "Ban";
  ban.onclick = () => {
    window.banPlayer(playerID);
  };
  banCell.appendChild(ban);
}

function removePlayer(playerID: number) {
  const playerRow = <HTMLTableElement>(
    document.getElementById(`client_playerlist_entry${playerID}`)
  );
  playerRow.remove();
}

/**
 * Handles a player joining or leaving
 * @param {Array} args packet arguments
 */
export const handlePR = (args: string[]) => {
  const playerID = Number(args[1]);
  if (Number(args[2]) === 0) addPlayer(playerID);
  else if (Number(args[2]) === 1) removePlayer(playerID);
};
