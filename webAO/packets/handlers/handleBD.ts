import { client } from "../../client";
import { handleBans } from "../../client/handleBans";

/**
 * Handles the banned packet
 * this one is sent when you try to reconnect but you're banned
 * @param {Array} args ban reason
 */
export const handleBD = (args: string[]) => {
  client.banned = true;
  handleBans("Banned", args[1]);
};
