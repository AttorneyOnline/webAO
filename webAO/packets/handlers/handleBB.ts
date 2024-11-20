import { safeTags } from "../../encoding";

/**
 * Handles the warning packet
 * on client this spawns a message box you can't close for 2 seconds
 * @param {Array} args ban reason
 */
export const handleBB = (args: string[]) => {
  alert(safeTags(args[1]));
};
