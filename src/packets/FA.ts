import { client } from "../client";
import { createArea } from "../client/createArea";
import { escapeFanta, unescapeFanta } from "../escaping";
import * as aolib from "../aolib";



/**
 * Handles updated area list
 */
export const applyFullAreaList = (packet: aolib.Out<typeof aolib.FA>) => {
  client.resetAreaList();

  for (let i = 0; i < packet.areas.length; i++) {
    createArea(i, packet.areas[i]);
  }
};
