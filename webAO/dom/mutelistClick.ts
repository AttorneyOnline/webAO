import { chars } from "../client";

/**
 * Triggered when a character in the mute list is clicked
 * @param {MouseEvent} event
 */
export function mutelist_click(_event: Event) {
  const mutelist = <HTMLSelectElement>document.getElementById("mute_select");
  const selected_character = mutelist.options[mutelist.selectedIndex];
  const selectedCharacterIndex = Number(selected_character.value);
  if (chars[selectedCharacterIndex].muted === false) {
    chars[selectedCharacterIndex].muted = true;
    selected_character.text = `${chars[selectedCharacterIndex].name} (muted)`;
    console.info(`muted ${chars[selectedCharacterIndex].name}`);
  } else {
    chars[selectedCharacterIndex].muted = false;
    selected_character.text = chars[selectedCharacterIndex].name;
  }
}
window.mutelist_click = mutelist_click;
