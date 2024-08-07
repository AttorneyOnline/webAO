import { client } from "../../client";

function addPlayer(playerID) {
const list = <HTMLTableElement>document.getElementById("client_playerlist");

}

function removePlayer(playerID) {
    const list = <HTMLTableElement>document.getElementById("client_playerlist");
    
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