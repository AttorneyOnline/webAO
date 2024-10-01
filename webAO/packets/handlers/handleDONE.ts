import queryParser from "../../utils/queryParser";
import {client, clientState} from "../../client";

const {mode} = queryParser()

/**
 * Handles the handshake completion packet, meaning the player
 * is ready to select a character.
 */
export function handleDONE() {
    // DONE packet signals that the handshake is complete
    client.state = clientState.Joined;
    document.getElementById("client_loadingtext")!.innerHTML = `Choose your character`;
    document.getElementById("client_charactersearch")!.focus();
    if (mode === "watch") {
        // Spectators don't need to pick a character
        document.getElementById("client_waiting")!.style.display = "none";
    }
}
