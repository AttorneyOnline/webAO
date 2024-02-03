import Client, { client, setClient } from "../client.js";
import queryParser from "../utils/queryParser.js";
const { ip: serverIP } = queryParser();

/**
 * Triggered when the reconnect button is pushed.
 */
export function ReconnectButton() {
    client.cleanup();
    setClient(new Client(serverIP));

    if (client) {
        document.getElementById("client_error")!.style.display = "none";
    }
}
window.ReconnectButton = ReconnectButton;