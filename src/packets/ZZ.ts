import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { unescapeUnicode, escapeFanta, safeHtmlTags, unescapeFanta } from "../escaping";
import * as aolib from "../aolib";

/**
 * Modcall packet. `reason` is per the AO spec; `target` is a non-spec
 * extension used by AO2-Client (and supported by tsuserver/akashi) to
 * direct the modcall at a specific player id (or `-1` for any mod).
 *
 * Servers only ever send `reason` to clients, so `target` is outbound-only
 * in practice -- but `decode` accepts it for symmetry.
 */


/**
 * Handles a modcall.
 */
export const showModcallNotice = (packet: aolib.Out<typeof aolib.ZZ>) => {
  const oocLog = document.getElementById("client_ooclog")!;
  const message = safeHtmlTags(unescapeUnicode(packet.reason)).replace(/\n/g, "<br>");
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

/**
 * Sends a modcall.
 */