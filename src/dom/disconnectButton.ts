import { client } from "../client";

/**
 * Triggered when the disconnect button in settings is pushed.
 * Forces a disconnection for testing purposes.
 */
export function DisconnectButton() {
  if (client.serv && client.serv.readyState === WebSocket.OPEN) {
    client.serv.close();
  }
}
window.DisconnectButton = DisconnectButton;
