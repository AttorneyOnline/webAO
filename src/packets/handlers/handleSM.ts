import { client } from "../../client";
import { addTrack } from "../../client/addTrack";
import { isAudio } from "../../client/isAudio";
import { fix_last_area } from "../../client/fixLastArea";
import { createArea } from "../../client/createArea";
import type { SMPacket } from "../types/SM";

/**
 * Handles incoming music information, containing all music in one packet.
 */
export const handleSM = (packet: SMPacket) => {
  document.getElementById("client_loadingtext")!.innerHTML = "Loading Music ";
  client.resetMusicList();
  client.resetAreaList();

  client.musics_time = false;

  document.getElementById("client_loadingtext")!.innerHTML = `Loading Music`;

  const tracks = packet.musicList;
  // Legacy iterated up to length-1 to skip the trailing empty entry from the
  // wire-format split.
  const end = tracks.length > 0 && tracks[tracks.length - 1] === ""
    ? tracks.length - 1
    : tracks.length;
  for (let i = 0; i < end; i++) {
    const trackname = tracks[i];
    const trackindex = i;

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
};
