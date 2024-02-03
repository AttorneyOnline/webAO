import { client } from "../../client.js";

/**
 * Handles the list of all used and vacant characters.
 * @param {Array} args list of all characters represented as a 0 for free or a -1 for taken
 */
export const handleCharsCheck = (args: string[]) => {
    for (let i = 0; i < client.char_list_length; i++) {
        const img = document.getElementById(`demo_${i}`)!;

        if (args[i + 1] === "-1") {
            img.style.opacity = "0.25";
        } else if (args[i + 1] === "0") {
            img.style.opacity = "1";
        }
    }
}