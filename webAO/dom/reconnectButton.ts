import { Client, client, setClient } from "../client";
import queryParser from "../utils/queryParser";

let { ip: serverIP } = queryParser();

/**
 * Triggered when the reconnect button is pushed.
 */
export function ReconnectButton() {
  // client.cleanup();
  // setClient(new Client(serverIP));
  // if (client) {
  //   document.getElementById("client_error")!.style.display = "none";
  // }
}
window.ReconnectButton = ReconnectButton;
