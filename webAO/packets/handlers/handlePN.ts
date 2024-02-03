import { client } from "../../client.js";

/**
 * Indicates how many users are on this server
 * @param {Array} args packet arguments
 */
export const handlePN = (_args: string[]) => {
    client.sender.sendServer("askchaa#%");
}