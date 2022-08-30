import { client } from "../../client";
import { safeTags } from "../../encoding";


/**
 * Handles updated music list
 * @param {Array} args packet arguments
 */
export const handleFM = (args: string[]) => {
    client.resetMusicList();

    for (let i = 1; i < args.length - 1; i++) {
        // Check when found the song for the first time
        client.addTrack(safeTags(args[i]));
    }
}
