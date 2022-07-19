import {
  char_list_length,
  client,
  evidence_list_length,
  musics_time,
  music_list_length,
  setMusicsTime,
} from "../../client";

/**
 * Handles incoming music information, containing all music in one packet.
 * @param {Array} args packet arguments
 */
export const handleSM = (args: string[]) => {
  document.getElementById("client_loadingtext").innerHTML = "Loading Music ";
  client.resetMusicList();
  client.resetAreaList();
  setMusicsTime(false);

  for (let i = 1; i < args.length - 1; i++) {
    // Check when found the song for the first time
    const trackname = args[i];
    const trackindex = i - 1;
    document.getElementById(
      "client_loadingtext"
    ).innerHTML = `Loading Music ${i}/${music_list_length}`;
    (<HTMLProgressElement>document.getElementById("client_loadingbar")).value =
      char_list_length + evidence_list_length + i;
    if (musics_time) {
      client.addTrack(trackname);
    } else if (client.isAudio(trackname)) {
      setMusicsTime(true);
      client.fix_last_area();
      client.addTrack(trackname);
    } else {
      client.createArea(trackindex, trackname);
    }
  }

  // Music done, carry on
  client.sendServer("RD#%");
};
