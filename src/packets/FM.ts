import { client } from "../client";
import { addTrack } from "../client/addTrack";
import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";

export interface FMPacket {
  music_list: string[];
}

export const FM: PacketCodec<FMPacket> = {
  header: "FM",
  decode(args) {
    return { music_list: args.slice(1).map((v) => unescapeFanta(v)) };
  },
  encode(packet) {
    return `FM#${packet.music_list.map(escapeFanta).join("#")}#%`;
  },
};

/**
 * Handles updated music list
 */
export const receiveFM = (packet: FMPacket) => {
  client.resetMusicList();

  // The legacy loop iterated `1..length-1`, skipping the trailing empty
  // string left by the wire-format split. We preserve that by dropping the
  // last entry if it is empty.
  const tracks = packet.music_list;
  const end = tracks.length > 0 && tracks[tracks.length - 1] === ""
    ? tracks.length - 1
    : tracks.length;
  for (let i = 0; i < end; i++) {
    addTrack(tracks[i]);
  }
};
