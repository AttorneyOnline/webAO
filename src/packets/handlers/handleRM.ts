import { client } from "../../client";
import vanilla_music_arr from "../../constants/music";
import type { RMPacket } from "../types/RM";

/**
 * we are asking ourselves what characters there are
 */
export const handleRM = (_packet: RMPacket) => {
  client.sender.sendSelf(`SM#${vanilla_music_arr.join("#")}#%`);
};
