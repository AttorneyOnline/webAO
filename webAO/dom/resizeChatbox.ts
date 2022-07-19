/**
 * Set the font size for the chatbox
 */
export function resizeChatbox() {
  const chatContainerBox = document.getElementById("client_chatcontainer");
  const gameHeight = document.getElementById("client_background").offsetHeight;

  chatContainerBox.style.fontSize = `${(gameHeight * 0.0521).toFixed(1)}px`;
}
window.resizeChatbox = resizeChatbox;
