import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Undocumented (not in the official Packet Reference). The legacy handler
 * uses `args[1]` as an offset/timestamp string passed directly to the audio
 * element, so we keep it as a raw string.
 */
export interface RMCPacket {
  // TODO: confirm field meaning -- the legacy handler stores this on
  // `music.totime` and adds it to `currentTime`, suggesting a seconds offset.
  toTime: string;
}

export const RMC: PacketCodec<RMCPacket> = {
  decode(args) {
    return { toTime: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `RMC#${escapeChat(packet.toTime)}#%`;
  },
};

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
