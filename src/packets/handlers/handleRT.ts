import { client } from "../../client";
import { initTestimonyUpdater } from "../../viewport/utils/initTestimonyUpdater";
import type { RTPacket } from "../types/RT";

/**
 * Handles a testimony states.
 */
export const handleRT = (packet: RTPacket) => {
  const judgeid = packet.judgeId ?? 0;
  switch (packet.animation) {
    case "testimony1":
      client.testimonyID = 1;
      break;
    case "testimony2":
      // Cross Examination
      client.testimonyID = 2;
      break;
    case "judgeruling":
      client.testimonyID = 3 + judgeid;
      break;
    default:
      console.warn("Invalid testimony");
  }
  initTestimonyUpdater();
};
