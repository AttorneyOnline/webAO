import { client } from "../client";
import * as aolib from "../aolib";



/**
 * Handles the list of all used and vacant characters.
 */
export const applyCharacterAvailability = (packet: aolib.Out<typeof aolib.CharsCheck>) => {
  for (let i = 0; i < client.char_list_length; i++) {
    const img = document.getElementById(`demo_${i}`)!;

    if (packet.taken[i] === -1) {
      img.style.opacity = "0.25";
    } else if (packet.taken[i] === 0) {
      img.style.opacity = "1";
    }
  }
};
