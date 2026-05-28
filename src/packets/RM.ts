import { client } from "../client";
import vanilla_music_arr from "../constants/music";
import type { PacketCodec } from "../packets";

export type RMPacket = Record<string, never>;

export const RM: PacketCodec<RMPacket> = {
  header: "RM",
  decode() {
    return {};
  },
  encode() {
    return `RM#%`;
  },
};

/**
 * we are asking ourselves what characters there are
 */
export const receiveRM = (_packet: RMPacket) => {
  client.sendToSelf(`SM#${vanilla_music_arr.join("#")}#%`);
};
