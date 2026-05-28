import { client } from "../client";
import vanilla_character_arr from "../constants/characters";
import type { PacketCodec } from "../packets";

export type RCPacket = Record<string, never>;

export const RC: PacketCodec<RCPacket> = {
  header: "RC",
  decode() {
    return {};
  },
  encode() {
    return `RC#%`;
  },
};

/**
 * we are asking ourselves what characters there are
 */
export const receiveRC = (_packet: RCPacket) => {
  client.sendToSelf(`SC#${vanilla_character_arr.join("#")}#%`);
};
