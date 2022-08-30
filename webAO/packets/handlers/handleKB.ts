import { client, setBanned } from "../../client";
import { safeTags } from "../../encoding";

/**
 * Handles the banned packet
 * this one is sent when you are kicked off the server
 * @param {Array} args ban reason
 */
export const handleKB = (args: string[]) => {
    client.handleBans("Banned", safeTags(args[1]));
    setBanned(true);
}
