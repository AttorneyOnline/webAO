import { client } from "../../client.js";
import { addTrack } from "../../client/addTrack.js";
import { safeTags } from "../../encoding.js";

/**
 * Handles updated music list
 * @param {Array} args packet arguments
 */
export const handleFM = (args: string[]) => {
    client.resetMusicList();

    for (let i = 1; i < args.length - 1; i++) {
        // Check when found the song for the first time
        addTrack(safeTags(args[i]));
    }
}
