import { client } from "../../client";


/**
 * Requests to change the music to the specified track.
 * @param {string} track the track ID
 */
export const sendMusicChange = (track: string) => {
    client.sender.sendServer(`MC#${track}#${client.charID}#%`);
}
