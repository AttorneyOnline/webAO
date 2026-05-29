import { client } from "../client";
import { safeHtmlTags } from "../escaping";
import { getFilenameFromPath } from "../utils/paths";

export const addTrack = (trackname: string) => {
  const newentry = <HTMLOptionElement>document.createElement("OPTION");
  const songName = getFilenameFromPath(trackname);
  // aolib's str field already unescaped chat-meta tokens before we got here.
  newentry.text = safeHtmlTags(songName);
  newentry.value = trackname;
  (<HTMLSelectElement>document.getElementById("client_musiclist")).options.add(
    newentry,
  );
  client.musics.push(trackname);
};

import { createArea } from "./createArea";
import { fix_last_area } from "./fixLastArea";
import { isAudio } from "./isAudio";
import type * as aolib from "../aolib";

/**
 * SM: server pushes the full music + area list at once. Areas come
 * first (until we hit an entry that's an audio file), then music.
 */
export const applyMusicListBatch = (packet: aolib.SMPacket) => {
  document.getElementById("client_loadingtext")!.innerHTML = "Loading Music";
  client.resetMusicList();
  client.resetAreaList();
  client.musics_time = false;

  const tracks = packet.music_list;
  // Legacy iterated up to length-1 to skip the trailing empty entry from the
  // wire-format split.
  const end = tracks.length > 0 && tracks[tracks.length - 1] === ""
    ? tracks.length - 1
    : tracks.length;
  for (let i = 0; i < end; i++) {
    const trackname = tracks[i];
    if (client.musics_time) {
      addTrack(trackname);
    } else if (isAudio(trackname)) {
      client.musics_time = true;
      fix_last_area();
      addTrack(trackname);
    } else {
      createArea(i, trackname);
    }
  }

  // Music done, carry on
  client.server.send.RD({});
};

/** FM: server pushes the full music list (refresh after edits). */
export const applyFullMusicList = (packet: aolib.FMPacket) => {
  client.resetMusicList();

  // Legacy iterated 1..length-1 to skip the trailing empty entry from
  // the wire-format split; we preserve that by dropping a trailing "".
  const tracks = packet.music_list;
  const end = tracks.length > 0 && tracks[tracks.length - 1] === ""
    ? tracks.length - 1
    : tracks.length;
  for (let i = 0; i < end; i++) {
    addTrack(tracks[i]);
  }
};

/**
 * EM: server pushes one incremental music/area batch. Entries before
 * the first audio file are areas; everything after is music. Acks by
 * requesting the next batch.
 */
export const applyEvidenceListBatch = (packet: aolib.EMPacket) => {
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
