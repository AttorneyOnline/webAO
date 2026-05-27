import { client } from "../../client";
import type { RMCPacket } from "../types/RMC";

// TODO BUG:
// this.viewport.music is an array. Therefore you must access elements
/**
 * Handles a music change to an arbitrary resource, with an offset in seconds.
 */
export const handleRMC = (packet: RMCPacket) => {
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
