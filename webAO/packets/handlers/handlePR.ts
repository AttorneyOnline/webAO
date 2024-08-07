import { client } from "../../client";

function addPlayer(playerID: Number) {
    const list = <HTMLTableElement>document.getElementById("client_playerlist");
    const playerRow = list.insertRow();
    playerRow.id = `client_playerlist_entry${playerID}`;

    const imgCell = playerRow.insertCell(0);
    const img = document.createElement('img');
    imgCell.appendChild(img);

    const nameCell = playerRow.insertCell(1);
    const name = document.createTextNode('Unknown');
    nameCell.appendChild(name);
}

function removePlayer(playerID: Number) {
    const playerRow = <HTMLTableElement>document.getElementById(`client_playerlist_entry${playerID}`);
    playerRow.remove();
}

/**
  * Handles a player joining or leaving
  * @param {Array} args packet arguments
  */
export const handlePR = (args: string[]) => {
    const playerID = Number(args[1]);
    if (Number(args[2]) === 0)
        addPlayer(playerID);
    else if (Number(args[2]) === 1)
        removePlayer(playerID);
}