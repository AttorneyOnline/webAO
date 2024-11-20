import { client } from "../../client";
// TODO BUG:
// this.viewport.music is an array. Therefore you must access elements
/**
 * Handles a music change to an arbitrary resource, with an offset in seconds.
 * @param {Array} args packet arguments
 */
export const handleRMC = (args: string[]) => {
  client.viewport.music.pause();
  const { music } = client.viewport;
  // Music offset + drift from song loading
  music.totime = args[1];
  music.offset = new Date().getTime() / 1000;
  music.addEventListener(
    "loadedmetadata",
    () => {
      music.currentTime += parseFloat(
        music.totime + (new Date().getTime() / 1000 - music.offset),
      ).toFixed(3);
      music.play();
    },
    false,
  );
};
