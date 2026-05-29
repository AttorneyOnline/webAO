import { client } from "../client";
import { addTrack } from "../client/addTrack";
import { createArea } from "../client/createArea";
import { fix_last_area } from "../client/fixLastArea";
import { isAudio } from "../client/isAudio";
import * as aolib from "../aolib";

/**
 * Incremental music/area list packet. Entries arrive as
 * (index, name) pairs; the first run of areas is followed by an
 * audio entry — that switch flips us into music-list mode.
 */
export const applyEvidenceListBatch = (packet: aolib.Out<typeof aolib.EM>) => {
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
  client.server.send.AM({ batch: packet.batchIndex / 10 + 1 });
};
