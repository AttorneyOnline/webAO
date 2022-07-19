/**
 * Handles a modcall
 * @param {Array} args packet arguments
 */
export const handleZZ = (args: string[]) => {
  const oocLog = document.getElementById("client_ooclog");
  oocLog.innerHTML += `$Alert: ${prepChat(args[1])}\r\n`;
  if (oocLog.scrollTop > oocLog.scrollHeight - 60) {
    oocLog.scrollTop = oocLog.scrollHeight;
  }

  this.viewport.getSfxAudio().pause();
  const oldvolume = this.viewport.getSfxAudio().volume;
  this.viewport.getSfxAudio().volume = 1;
  this.viewport.getSfxAudio().src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
  this.viewport.getSfxAudio().play();
  this.viewport.getSfxAudio().volume = oldvolume;
};
