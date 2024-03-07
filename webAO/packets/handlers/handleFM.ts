import { client } from "../../client";
import { addTrack } from "../../client/addTrack";
import { safeTags } from "../../encoding";

/**
 * Handles updated music list
 * @param {Array} args packet arguments
 */
export const handleFM = (args: string[]) => {
    client.resetMusicList();

    for (let i = 1; i < args.length - 1; i++) {
        // Check when found the song for the first time
        addTrack(args[i]);
    }
}
