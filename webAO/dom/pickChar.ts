/**
 * Requests to play as a character.
 * @param {number} ccharacter the character ID; if this is a large number,
 * then spectator is chosen instead.
 */
export function pickChar(ccharacter: number) {
  if (ccharacter === -1) {
    // Spectator
    document.getElementById("client_waiting").style.display = "none";
    document.getElementById("client_charselect").style.display = "none";
  }
  client.sendCharacter(ccharacter);
}
window.pickChar = pickChar;
