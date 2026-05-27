import { client } from "../../client";
import { createArea } from "../../client/createArea";
import type { FAPacket } from "../types/FA";

/**
 * Handles updated area list
 */
export const handleFA = (packet: FAPacket) => {
  client.resetAreaList();

  for (let i = 0; i < packet.areas.length; i++) {
    createArea(i, packet.areas[i]);
  }
};
