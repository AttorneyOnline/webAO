/**
 * Server-side messages that write to the out-of-character log: regular
 * OOC chat (CT) and modcall alerts (ZZ). Both render through
 * `#client_ooclog`; sharing a file keeps the scroll/format conventions
 * in one place.
 */

import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import { unescapeUnicode, safeHtmlTags } from "../escaping";
import queryParser from "../utils/queryParser";
import { flashPairActivity } from "./pairNotification";
import type * as aolib from "../aolib";

const { mode } = queryParser();

function addLinks(message: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`,
  );
}

/** CT: server broadcast of an OOC chat message; append to the log. */
export const appendOOCMessage = (packet: aolib.Out<typeof aolib.CTBroadcast>) => {
  if (mode === "replay") return;

  const oocLog = document.getElementById("client_ooclog")!;
  const username = safeHtmlTags(unescapeUnicode(packet.name));
  const rawMessage = safeHtmlTags(unescapeUnicode(packet.message));
  let message = addLinks(rawMessage);
  message = message.replace(/\n/g, "<br>");

  oocLog.innerHTML += `${username}: ${message}<br>`;
  if (oocLog.scrollTop + oocLog.offsetHeight + 120 > oocLog.scrollHeight) {
    oocLog.scrollTo(0, oocLog.scrollHeight);
  }

  flashPairActivity(rawMessage);
};

/** ZZ: server modcall broadcast; show a `$Alert:` notice and play the gallery sfx. */
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
