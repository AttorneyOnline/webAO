import { client } from "../../client";
import { handleBans } from "../../client/handleBans";
import type { KKPacket } from "../types/KK";

/**
 * Handles the kicked packet
 */
export const handleKK = (packet: KKPacket) => {
  client.banned = true;
  handleBans("Kicked", packet.reason);
};
