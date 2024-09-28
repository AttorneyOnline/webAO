import { client } from "../../client";

/**
 * Requests to play as a specified character.
 * @param {number} charId the character ID
 */
export const sendCharacter = (charId: number) => {
    if (charId === -1 || client.chars.get(charId).name) {
        client.sender.sendServer(`CC#${client.playerID}#${charId}#web#%`);
    }
}
