/**
 * Handles the banned packet
 * this one is sent when you try to reconnect but you're banned
 * @param {Array} args ban reason
 */
export const handleBD = (args: string[]) => {
  this.handleBans("Banned", safeTags(args[1]));
  banned = true;
};
