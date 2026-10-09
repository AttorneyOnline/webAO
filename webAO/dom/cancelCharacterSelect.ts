import { client } from "../client";
import { changeChar } from "../client/changeChar";

/**
 * Closes the character selection popup without changing the currently
 * selected character. Restores the emote panel that `changeCharacter()`
 * clears when the popup opens.
 */
export function cancelCharacterSelect() {
  document.getElementById("client_waiting")!.style.display = "none";
  document.getElementById("client_charselect")!.style.display = "none";
  if (client.charID >= 0) {
    changeChar(client.charID);
  }
}
window.cancelCharacterSelect = cancelCharacterSelect;
