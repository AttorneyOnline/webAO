import { client } from "../../client";


/**
 * Requests to select a music track.
 * @param {number?} song the song to be played
 */
export const sendMusic = (song: string) => {
    client.sender.sendServer(`MC#${song}#${client.charID}#%`);
}