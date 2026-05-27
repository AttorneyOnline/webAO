import { client } from "../client";
import { addTrack } from "../client/addTrack";
import { createArea } from "../client/createArea";
import { fix_last_area } from "../client/fixLastArea";
import { isAudio } from "../client/isAudio";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Incremental music/area list packet. Wire format is essentially
 * `EM#{batch_index}#{idx0}#{name0}#{idx1}#{name1}#...#%`. The trailing entry
 * is empty due to wire-format split semantics, so we drop it.
 */
export interface EMPacket {
  batchIndex: number;
  // TODO: confirm field meaning -- legacy handler treats odd-indexed pairs
  // as `(trackIndex, trackName)`.
  entries: { index: number; name: string }[];
}

export const EM: PacketCodec<EMPacket> = {
  decode(args) {
    const batchIndex = Number(args[1]);
    const entries: { index: number; name: string }[] = [];
    // args = ["EM", batchIndex, idx0, name0, idx1, name1, ..., ""]
    for (let i = 2; i < args.length - 1; i += 2) {
      if (args[i + 1] === undefined) break;
      entries.push({
        index: Number(args[i]),
        name: unescapeChat(args[i + 1]),
      });
    }
    return { batchIndex, entries };
  },
  encode(packet) {
    const flat = packet.entries
      .map((e) => `${e.index}#${escapeChat(e.name)}`)
      .join("#");
    return `EM#${packet.batchIndex}#${flat}#%`;
  },
};

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
