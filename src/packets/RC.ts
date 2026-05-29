import { client } from "../client";
import vanilla_character_arr from "../constants/characters";
import * as aolib from "../aolib";

/**
 * Replay-mode synthesis: when the local client requests the character
 * list, feed back the bundled vanilla list as if a server had sent it.
 */
export function onCharacterListRequest() {
  client.server.receive(`SC#${vanilla_character_arr.join("#")}#%`);
}
