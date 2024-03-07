import queryParser from "../../utils/queryParser";

import { client } from '../../client'
import { handleCharacterInfo } from "../../client/handleCharacterInfo";
const { mode } = queryParser();

/**
 * Handles incoming character information, containing all characters
 * in one packet.
 * @param {Array} args packet arguments
 */
export const handleSC = async (args: string[]) => {
    if (mode === "watch") {
        // Spectators don't need to pick a character
        document.getElementById("client_charselect")!.style.display = "none";
    } else {
        document.getElementById("client_charselect")!.style.display = "block";
    }

    document.getElementById("client_loadingtext")!.innerHTML =
        "Loading Characters";
    for (let i = 1; i < args.length; i++) {
        const chargs = args[i].split("&");
        const charid = i - 1;

        setTimeout(() => handleCharacterInfo(chargs, charid), charid*6);
    }
    // We're done with the characters, request the music
    client.sender.sendServer("RM#%");
}