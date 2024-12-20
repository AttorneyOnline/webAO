import { setBanned } from "../../client";
import { handleBans } from "../../client/handleBans";

/**
 * Handles the banned packet
 * this one is sent when you try to reconnect but you're banned
 * @param {Array} args ban reason
 */
export const handleBD = (args: string[]) => {
  handleBans("Banned", args[1]);
  setBanned(true);
};
