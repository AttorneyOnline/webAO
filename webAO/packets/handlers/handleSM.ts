import { client } from '../../client'
import { addTrack } from '../../client/addTrack'
import { isAudio } from '../../client/isAudio'
import { fix_last_area } from '../../client/fixLastArea'
import { createArea } from '../../client/createArea'
/**
 * Handles incoming music information, containing all music in one packet.
 * @param {Array} args packet arguments
 */
export const handleSM = (args: string[]) => {
    document.getElementById("client_loadingtext")!.innerHTML = "Loading Music ";
    client.resetMusicList();
    client.resetAreaList();

    client.musics_time = false;

    for (let i = 1; i < args.length - 1; i++) {
        // Check when found the song for the first time
        const trackname = args[i];
        const trackindex = i - 1;
        document.getElementById(
            "client_loadingtext"
        )!.innerHTML = `Loading Music ${i}/${client.music_list_length}`;
        (<HTMLProgressElement>(
            document.getElementById("client_loadingbar")
        )).value = client.char_list_length + client.evidence_list_length + i;
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

    // Music done, carry on
    client.sender.sendServer("RD#%");
}
