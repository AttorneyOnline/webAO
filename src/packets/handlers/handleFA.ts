import { client } from "../../client";
import { createArea } from "../../client/createArea";

/**
 * Handles updated area list
 * @param {Array} args packet arguments
 */
export const handleFA = (args: string[]) => {
  client.resetAreaList();

  for (let i = 1; i < args.length; i++) {
    createArea(i - 1, args[i]);
  }
};
