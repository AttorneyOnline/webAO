import { client } from "../../client";
import vanilla_character_arr from "../../constants/characters.js";

/**
 * What? you want a character list from me??
 * @param {Array} args packet arguments
 */
export const handleaskchaa = (_args: string[]) => {
  client.sendSelf(`SI#${vanilla_character_arr.length}#0#0#%`);
};
