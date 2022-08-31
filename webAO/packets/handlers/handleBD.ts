import { client, setBanned } from "../../client";
import { safeTags } from "../../encoding";


/**
 * Handles the banned packet
 * this one is sent when you try to reconnect but you're banned
 * @param {Array} args ban reason
 */
export const handleBD = (args: string[]) => {
    client.handleBans("Banned", safeTags(args[1]));
    setBanned(true);
}