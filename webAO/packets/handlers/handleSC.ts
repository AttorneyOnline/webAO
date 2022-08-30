import queryParser from "../../utils/queryParser";

import { client } from '../../client'
let { mode } = queryParser();

/**
 * Handles incoming character information, containing all characters
 * in one packet.
 * @param {Array} args packet arguments
 */
export const handleSC = async (args: string[]) => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    if (mode === "watch") {
        // Spectators don't need to pick a character
        document.getElementById("client_charselect")!.style.display = "none";
    } else {
        document.getElementById("client_charselect")!.style.display = "block";
    }

    document.getElementById("client_loadingtext")!.innerHTML =
        "Loading Characters";
    for (let i = 1; i < args.length - 1; i++) {
        document.getElementById(
            "client_loadingtext"
        )!.innerHTML = `Loading Character ${i}/${client.char_list_length}`;
        const chargs = args[i].split("&");
        const charid = i - 1;
        (<HTMLProgressElement>(
            document.getElementById("client_loadingbar")
        )).value = charid;
        await sleep(0.1); // TODO: Too many network calls without this. net::ERR_INSUFFICIENT_RESOURCES
        client.handleCharacterInfo(chargs, charid);
    }
    // We're done with the characters, request the music
    client.sendServer("RM#%");
}