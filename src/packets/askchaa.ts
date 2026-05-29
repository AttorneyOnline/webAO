import { client } from "../client";
import vanilla_character_arr from "../constants/characters";
import * as aolib from "../aolib";

export type AskchaaPacket = Record<string, never>;


/**
 * What? you want a character list from me??
 */
export const onAreaCharRequest = (_packet: AskchaaPacket) => {
  client.server.receive(`SI#${vanilla_character_arr.length}#0#0#%`);
};
