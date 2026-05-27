import { client } from "../../client";
import vanilla_character_arr from "../../constants/characters";
import type { AskchaaPacket } from "../types/askchaa";

/**
 * What? you want a character list from me??
 */
export const handleaskchaa = (_packet: AskchaaPacket) => {
  client.sender.sendSelf(`SI#${vanilla_character_arr.length}#0#0#%`);
};
