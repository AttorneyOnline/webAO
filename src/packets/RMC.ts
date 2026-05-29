import { client } from "../client";
import * as aolib from "../aolib";

/**
 * Undocumented (not in the official Packet Reference). The legacy handler
 * uses `args[1]` as an offset/timestamp string passed directly to the audio
 * element, so we keep it as a raw string.
 */


// TODO BUG:
// this.viewport.music is an array. Therefore you must access elements
/**
 * Handles a music change to an arbitrary resource, with an offset in seconds.
 */
export const applyMusicSeek = (packet: aolib.Out<typeof aolib.RMC>) => {
  client.viewport.music.pause();
  const { music } = client.viewport;
  // Music offset + drift from song loading
  music.totime = packet.toTime;
  music.offset = new Date().getTime() / 1000;
  music.addEventListener(
    "loadedmetadata",
    () => {
      music.currentTime += parseFloat(
        music.totime + (new Date().getTime() / 1000 - music.offset),
      ).toFixed(3);
      music.play().catch(() => {});
    },
    false,
  );
};
