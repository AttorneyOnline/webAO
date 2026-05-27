import { client } from "../client";
import vanilla_music_arr from "../constants/music";
import type { PacketCodec } from "../packets";

export type RMPacket = Record<string, never>;

export const RM: PacketCodec<RMPacket> = {
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
export const handleRM = (_packet: RMPacket) => {
  client.sender.sendSelf(`SM#${vanilla_music_arr.join("#")}#%`);
};
