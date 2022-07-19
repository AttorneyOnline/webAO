/**
 * Handles the banned packet
 * this one is sent when you are kicked off the server
 * @param {Array} args ban reason
 */
export const handleKB = (args: string[]) => {
  this.handleBans("Banned", safeTags(args[1]));
  banned = true;
};
