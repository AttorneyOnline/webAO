import { client } from "../client";
import vanilla_character_arr from "../constants/characters";
import type { PacketCodec } from "../packets";

export type AskchaaPacket = Record<string, never>;

export const askchaa: PacketCodec<AskchaaPacket> = {
  header: "askchaa",
  decode() {
    return {};
  },
  encode() {
    return `askchaa#%`;
  },
};

/**
 * What? you want a character list from me??
 */
export const receiveaskchaa = (_packet: AskchaaPacket) => {
  client.sendToSelf(`SI#${vanilla_character_arr.length}#0#0#%`);
};
