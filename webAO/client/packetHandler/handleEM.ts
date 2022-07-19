import {
  char_list_length,
  client,
  evidence_list_length,
  musics_time,
  setMusicsTime,
} from "../../client";
/**
 * Handles incoming music information, containing multiple entries
 * per packet.
 * @param {Array} args packet arguments
 */

import { safeTags } from "../../encoding";
export const handleEM = (args: string[]) => {
  document.getElementById("client_loadingtext")!.innerHTML = "Loading Music";
  if (args[1] === "0") {
    client.resetMusicList();
    client.resetAreaList();
    setMusicsTime(false);
  }

  for (let i = 2; i < args.length - 1; i++) {
    if (i % 2 === 0) {
      const trackname = safeTags(args[i]);
      const trackindex = Number(args[i - 1]);
      (<HTMLProgressElement>(
        document.getElementById("client_loadingbar")
      )).value = char_list_length + evidence_list_length + trackindex;
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
  }

  // get the next batch of tracks
  client.sendServer(`AM#${Number(args[1]) / 10 + 1}#%`);
};
