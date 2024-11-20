import { safeTags } from "../../encoding";
import { handleBans } from "../../client/handleBans";

/**
 * Handles the kicked packet
 * @param {Array} args kick reason
 */
export const handleKK = (args: string[]) => {
  handleBans("Kicked", safeTags(args[1]));
};
