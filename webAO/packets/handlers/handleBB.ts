/**
 * Handles the warning packet
 * on client this spawns a message box you can't close for 2 seconds
 * @param {Array} args ban reason
 */
export const handleBB = (args: string[]) => {
  alert(args[1]);
};
