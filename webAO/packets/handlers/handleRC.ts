import { client } from "../../client.js";
import vanilla_character_arr from "../../constants/characters.js";

/**
 * we are asking ourselves what characters there are
 * @param {Array} args packet arguments
 */
export const handleRC = (_args: string[]) => {
    client.sender.sendSelf(`SC#${vanilla_character_arr.join("#")}#%`);
}