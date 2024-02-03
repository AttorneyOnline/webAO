import { setBanned } from "../../client.js";
import { safeTags } from "../../encoding.js";
import { handleBans } from '../../client/handleBans.js'

/**
 * Handles the banned packet
 * this one is sent when you are kicked off the server
 * @param {Array} args ban reason
 */
export const handleKB = (args: string[]) => {
    handleBans("Banned", safeTags(args[1]));
    setBanned(true);
}
