import queryParser from "../../utils/queryParser";

import { client } from '../../client'
import { handleCharacterInfo, getCharIcon } from "../../client/handleCharacterInfo";
import { CharData } from "../../client/CharData";
const { mode } = queryParser();

/**
 * Handles incoming character information, containing all characters
 * in one packet.
 * @param {Array} args packet arguments
 */
export async function handleSC(args: string[]) {
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
        const charName = chargs[0];
        // Optional field
        const charDesc = chargs.length > 1 ? chargs[1] : '';
        // Puzzling optional field that seems to be documented nowhere
        const charEvidence = chargs.length > 3 ? chargs[3] : '';

        const charData: CharData = {
            id: charid,
            name: charName,
            desc: charDesc,
            evidence: charEvidence,
        };

        // Set initial known data
        client.chars.set(charid, charData);

        const charButtonElement: HTMLDivElement = <HTMLDivElement>document.getElementById(`demo_${charid}`);

        // Text hint before the char icon is loaded
        charButtonElement.textContent = charName;

        // Load the rest of the char data here
        // Stagger the requests with 6ms intervals
        setTimeout(() => handleCharacterInfo(chargs[0], charid), charid*6);
    }
    // We're done with the characters, request the music
    client.sender.sendServer("RM#%");
}
