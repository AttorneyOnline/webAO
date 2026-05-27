import { client } from "../../client";
import vanilla_character_arr from "../../constants/characters";
import type { RCPacket } from "../types/RC";

/**
 * we are asking ourselves what characters there are
 */
export const handleRC = (_packet: RCPacket) => {
  client.sender.sendSelf(`SC#${vanilla_character_arr.join("#")}#%`);
};
