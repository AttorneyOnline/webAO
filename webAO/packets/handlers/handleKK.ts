import { client } from "../../client";
import { safeTags } from "../../encoding";


/**
 * Handles the kicked packet
 * @param {Array} args kick reason
 */
export const handleKK = (args: string[]) => {
    client.handleBans("Kicked", safeTags(args[1]));
}
