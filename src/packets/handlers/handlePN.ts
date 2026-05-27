import { client } from "../../client";
import type { PNPacket } from "../types/PN";

/**
 * Indicates how many users are on this server
 */
export const handlePN = (_packet: PNPacket) => {
  client.sender.sendServer("askchaa#%");
};
