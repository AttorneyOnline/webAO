import { client } from "../../client";
import type { CCPacket } from "../types/CC";

/**
 * What? you want a character??
 */
export const handleCC = (packet: CCPacket) => {
  client.sender.sendSelf(`PV#1#CID#${packet.charId}#%`);
};
