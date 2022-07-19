/**
 * Handles the kicked packet
 * @param {Array} args kick reason
 */
export const handleKK = (args: string[]) => {
  this.handleBans("Kicked", safeTags(args[1]));
};
