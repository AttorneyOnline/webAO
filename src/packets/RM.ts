import { client } from "../client";
import vanilla_music_arr from "../constants/music";
import * as aolib from "../aolib";

/**
 * Replay-mode synthesis: when the local client requests the music
 * list, feed back the bundled vanilla list as if a server had sent it.
 */
export function onMusicListRequest() {
  client.server.receive(`SM#${vanilla_music_arr.join("#")}#%`);
}
