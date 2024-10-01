import { client } from "../client";
import { handleCharacterInfo } from "../client/handleCharacterInfo";

/**
 * Requests to play as a character.
 * @param {number} ccharacter the character ID; if this is a large number,
 * then spectator is chosen instead.
 */
export function pickChar(ccharacter: number) {
    if (ccharacter === -1) {
        // Spectator
        document.getElementById("client_waiting")!.style.display = "none";
        document.getElementById("client_charselect")!.style.display = "none";
    }

    const charData = client.chars.get(ccharacter);

    if (charData.inifile) {
        client.sender.sendCharacter(ccharacter);
    } else {
        // This means the character is not fully loaded yet
        // and we need to do so before picking it for playing
        console.log(`fast-tracking loading for ${ccharacter}`);
        handleCharacterInfo(charData.name, ccharacter).then(() => {
            client.sender.sendCharacter(ccharacter);
        });
    }
}

window.pickChar = pickChar;
