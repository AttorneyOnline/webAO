/**
 * Triggered when the reconnect button is pushed.
 */
export function ReconnectButton() {
  client.cleanup();
  client = new Client(serverIP);

  if (client) {
    document.getElementById("client_error").style.display = "none";
  }
}
window.ReconnectButton = ReconnectButton;
