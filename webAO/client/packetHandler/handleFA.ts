/**
 * Handles updated area list
 * @param {Array} args packet arguments
 */
export const handleFA = (args: string[]) => {
  this.resetAreaList();

  for (let i = 1; i < args.length - 1; i++) {
    this.createArea(i - 1, safeTags(args[i]));
  }
};
