import { client } from '../../client'
import { addTrack } from '../../client/addTrack';
import { createArea } from '../../client/createArea';
import { fix_last_area } from '../../client/fixLastArea';
import { isAudio } from '../../client/isAudio';

/**
 * Handles incoming music information, containing multiple entries
 * per packet.
 * @param {Array} args packet arguments
 */
export const handleEM = (args: string[]) => {
    document.getElementById("client_loadingtext")!.innerHTML = "Loading Music";
    if (args[1] === "0") {
        client.resetMusicList();
        client.resetAreaList();
        client.musics_time = false;
    }

    for (let i = 2; i < args.length - 1; i++) {
        if (i % 2 === 0) {
            const trackname = args[i];
            const trackindex = Number(args[i - 1]);
            if (client.musics_time) {
                addTrack(trackname);
            } else if (isAudio(trackname)) {
                client.musics_time = true;
                fix_last_area();
                addTrack(trackname);
            } else {
                createArea(trackindex, trackname);
            }
        }
    }
    // get the next batch of tracks
    client.sender.sendServer(`AM#${Number(args[1]) / 10 + 1}#%`);
}