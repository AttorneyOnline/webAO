import { AO_HOST } from "../../client";
import { prepChat } from "../../encoding";
import { sfxAudio } from "../../viewport";

/**
 * Handles a modcall
 * @param {Array} args packet arguments
 */

export const handleZZ = (args: string[]) => {
  const oocLog = document.getElementById("client_ooclog")!;
  oocLog.innerHTML += `$Alert: ${prepChat(args[1])}\r\n`;
  if (oocLog.scrollTop > oocLog.scrollHeight - 60) {
    oocLog.scrollTop = oocLog.scrollHeight;
  }

  sfxAudio.pause();
  const oldvolume = sfxAudio.volume;
  sfxAudio.volume = 1;
  sfxAudio.src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
  sfxAudio.play();
  sfxAudio.volume = oldvolume;
};
