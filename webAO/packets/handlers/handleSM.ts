import { client } from '../../client'
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
            client.addTrack(trackname);
        } else if (client.isAudio(trackname)) {
            client.musics_time = true;
            client.fix_last_area();
            client.addTrack(trackname);
        } else {
            client.createArea(trackindex, trackname);
        }
    }

    // Music done, carry on
    client.sender.sendServer("RD#%");
}
