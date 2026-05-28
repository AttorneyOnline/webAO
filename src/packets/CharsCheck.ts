import { client } from "../client";
import type { PacketCodec } from "../packets";

export interface CharsCheckPacket {
  taken: number[];
}

export const CharsCheck: PacketCodec<CharsCheckPacket> = {
  header: "CharsCheck",
  decode(args) {
    return { taken: args.slice(1).map((v) => Number(v)) };
  },
  encode(packet) {
    return `CharsCheck#${packet.taken.join("#")}#%`;
  },
};

/**
 * Handles the list of all used and vacant characters.
 */
export const receiveCharsCheck = (packet: CharsCheckPacket) => {
  for (let i = 0; i < client.char_list_length; i++) {
    const img = document.getElementById(`demo_${i}`)!;

    if (packet.taken[i] === -1) {
      img.style.opacity = "0.25";
    } else if (packet.taken[i] === 0) {
      img.style.opacity = "1";
    }
  }
};
