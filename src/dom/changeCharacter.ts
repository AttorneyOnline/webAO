/**
 * Triggered when a character icon is clicked in the character selection menu.
 * @param {MouseEvent} event
 */
export function changeCharacter(_event: Event) {
  document.getElementById("client_waiting")!.style.display = "block";
  document.getElementById("client_charselect")!.style.display = "block";
  document.getElementById("client_emo")!.innerHTML = "";
}
window.changeCharacter = changeCharacter;
