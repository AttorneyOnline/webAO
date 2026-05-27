import { client } from "../../client";
import { handleBans } from "../../client/handleBans";
import type { KBPacket } from "../types/KB";

/**
 * Handles the banned packet
 * this one is sent when you are kicked off the server
 */
export const handleKB = (packet: KBPacket) => {
  client.banned = true;
  handleBans("Banned", packet.reason);
};
