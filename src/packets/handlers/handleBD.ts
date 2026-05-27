import { client } from "../../client";
import { handleBans } from "../../client/handleBans";
import type { BDPacket } from "../types/BD";

/**
 * Handles the banned packet
 * this one is sent when you try to reconnect but you're banned
 */
export const handleBD = (packet: BDPacket) => {
  client.banned = true;
  handleBans("Banned", packet.reason);
};
