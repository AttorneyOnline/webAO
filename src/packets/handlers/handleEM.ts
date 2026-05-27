import { client } from "../../client";
import { addTrack } from "../../client/addTrack";
import { createArea } from "../../client/createArea";
import { fix_last_area } from "../../client/fixLastArea";
import { isAudio } from "../../client/isAudio";
import type { EMPacket } from "../types/EM";

/**
 * Handles incoming music information, containing multiple entries
 * per packet.
 */
export const handleEM = (packet: EMPacket) => {
  document.getElementById("client_loadingtext")!.innerHTML = "Loading Music";
  if (packet.batchIndex === 0) {
    client.resetMusicList();
    client.resetAreaList();
    client.musics_time = false;
  }

  for (const { index, name } of packet.entries) {
    if (client.musics_time) {
      addTrack(name);
    } else if (isAudio(name)) {
      client.musics_time = true;
      fix_last_area();
      addTrack(name);
    } else {
      createArea(index, name);
    }
  }
  // get the next batch of tracks
  client.sender.sendServer(`AM#${packet.batchIndex / 10 + 1}#%`);
};
