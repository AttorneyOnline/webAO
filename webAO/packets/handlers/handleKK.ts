import { safeTags } from "../../encoding.js";
import { handleBans } from '../../client/handleBans.js'

/**
 * Handles the kicked packet
 * @param {Array} args kick reason
 */
export const handleKK = (args: string[]) => {
    handleBans("Kicked", safeTags(args[1]));
}
