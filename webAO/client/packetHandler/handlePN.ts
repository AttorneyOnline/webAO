import { client } from "../../client";
/**
 * Indicates how many users are on this server
 * @param {Array} args packet arguments
 */
export const handlePN = (_args: string[]) => {
  client.sendServer("askchaa#%");
};
