/**
 * Handles incoming music information, containing multiple entries
 * per packet.
 * @param {Array} args packet arguments
 */
export const handleEM = (args: string[]) => {
  document.getElementById("client_loadingtext").innerHTML = "Loading Music";
  if (args[1] === "0") {
    this.resetMusicList();
    this.resetAreaList();
    this.musics_time = false;
  }

  for (let i = 2; i < args.length - 1; i++) {
    if (i % 2 === 0) {
      const trackname = safeTags(args[i]);
      const trackindex = Number(args[i - 1]);
      (<HTMLProgressElement>(
        document.getElementById("client_loadingbar")
      )).value = this.char_list_length + this.evidence_list_length + trackindex;
      if (this.musics_time) {
        this.addTrack(trackname);
      } else if (this.isAudio(trackname)) {
        this.musics_time = true;
        this.fix_last_area();
        this.addTrack(trackname);
      } else {
        this.createArea(trackindex, trackname);
      }
    }
  }

  // get the next batch of tracks
  this.sendServer(`AM#${Number(args[1]) / 10 + 1}#%`);
};
