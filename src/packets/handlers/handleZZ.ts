import { client } from "../../client";
import { AO_HOST } from "../../client/aoHost";
import { decodeChat, safeTags } from "../../encoding";
import type { ZZPacket } from "../types/ZZ";

/**
 * Handles a modcall.
 */
export const handleZZ = (packet: ZZPacket) => {
  const oocLog = document.getElementById("client_ooclog")!;
  const message = safeTags(decodeChat(packet.reason)).replace(/\n/g, "<br>");
  oocLog.innerHTML += `$Alert: ${message}<br>`;
  if (oocLog.scrollTop > oocLog.scrollHeight - 60) {
    oocLog.scrollTop = oocLog.scrollHeight;
  }

  client.viewport.getSfxAudio().pause();
  const oldvolume = client.viewport.getSfxAudio().volume;
  client.viewport.getSfxAudio().volume = 1;
  client.viewport.getSfxAudio().src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
  client.viewport.getSfxAudio().play().catch(() => {});
  client.viewport.getSfxAudio().volume = oldvolume;
};
