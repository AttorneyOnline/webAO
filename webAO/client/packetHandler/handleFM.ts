/**
 * Handles updated music list
 * @param {Array} args packet arguments
 */
export const handleFM = (args: string[]) => {
  this.resetMusicList();

  for (let i = 1; i < args.length - 1; i++) {
    // Check when found the song for the first time
    this.addTrack(safeTags(args[i]));
  }
};
