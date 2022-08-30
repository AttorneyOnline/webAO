import { client } from '../../client'
import { safeTags } from '../../encoding';

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
            const trackname = safeTags(args[i]);
            const trackindex = Number(args[i - 1]);
            (<HTMLProgressElement>(
                document.getElementById("client_loadingbar")
            )).value =
                client.char_list_length + client.evidence_list_length + trackindex;
            if (client.musics_time) {
                client.addTrack(trackname);
            } else if (client.isAudio(trackname)) {
                client.musics_time = true;
                client.fix_last_area();
                client.addTrack(trackname);
            } else {
                client.createArea(trackindex, trackname);
            }
        }
    }

    // get the next batch of tracks
    client.sendServer(`AM#${Number(args[1]) / 10 + 1}#%`);
}