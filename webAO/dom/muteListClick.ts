import { client } from "../client";

/**
 * Triggered when a character in the mute list is clicked
 */
export function mutelist_click() {
    const mutelist: HTMLSelectElement = <HTMLSelectElement>(document.getElementById('mute_select'));
    const selectedCharElement: HTMLOptionElement = mutelist.options[mutelist.selectedIndex];

    const charId: number = parseInt(selectedCharElement.value, 10);
    const selectedChar = client.chars.get(charId);

    if (selectedChar.muted === false) {
        selectedChar.muted = true;
        selectedCharElement.text = `${selectedChar.name} (muted)`;
        console.info(`muted ${selectedChar.name}`);
    } else {
        selectedChar.muted = false;
        selectedCharElement.text = selectedChar.name;
    }
}

window.mutelist_click = mutelist_click;
