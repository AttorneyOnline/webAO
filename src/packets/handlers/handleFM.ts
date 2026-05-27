import { client } from "../../client";
import { addTrack } from "../../client/addTrack";
import type { FMPacket } from "../types/FM";

/**
 * Handles updated music list
 */
export const handleFM = (packet: FMPacket) => {
  client.resetMusicList();

  // The legacy loop iterated `1..length-1`, skipping the trailing empty
  // string left by the wire-format split. We preserve that by dropping the
  // last entry if it is empty.
  const tracks = packet.musicList;
  const end = tracks.length > 0 && tracks[tracks.length - 1] === ""
    ? tracks.length - 1
    : tracks.length;
  for (let i = 0; i < end; i++) {
    addTrack(tracks[i]);
  }
};
