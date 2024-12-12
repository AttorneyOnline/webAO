import { setBanned } from "../../client";
import { handleBans } from "../../client/handleBans";

/**
 * Handles the banned packet
 * this one is sent when you are kicked off the server
 * @param {Array} args ban reason
 */
export const handleKB = (args: string[]) => {
  handleBans("Banned", args[1]);
  setBanned(true);
};
