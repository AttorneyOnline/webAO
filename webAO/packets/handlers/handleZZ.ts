import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { prepChat } from "../../encoding";

/**
 * Handles a modcall
 * @param {Array} args packet arguments
 */
export const handleZZ = (args: string[]) => {
  const oocLog = document.getElementById("client_ooclog")!;
  const message = args[1].replace(/\n/g, "<br>");
  oocLog.innerHTML += `$Alert: ${prepChat(message)}<br>`;
  if (oocLog.scrollTop > oocLog.scrollHeight - 60) {
    oocLog.scrollTop = oocLog.scrollHeight;
  }

  client.viewport.getSfxAudio().pause();
  const oldvolume = client.viewport.getSfxAudio().volume;
  client.viewport.getSfxAudio().volume = 1;
  client.viewport.getSfxAudio().src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
  client.viewport.getSfxAudio().play();
  client.viewport.getSfxAudio().volume = oldvolume;
};
