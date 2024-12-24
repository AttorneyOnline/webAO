import { client } from "../../client";
import { handleBans } from "../../client/handleBans";

/**
 * Handles the kicked packet
 * @param {Array} args kick reason
 */
export const handleKK = (args: string[]) => {
  client.banned = true;
  handleBans("Kicked", args[1]);
};
