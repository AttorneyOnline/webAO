import { client } from "../client";
import {
  unescapeUnicode,
  escapeFanta,
  safeHtmlTags,
  unescapeFanta,
} from "../escaping";
import queryParser from "../utils/queryParser";
import { flashPairActivity } from "../dom/pairNotification";
import * as aolib from "../aolib";

/**
 * OOC chat message. The wire format differs by direction:
 *   Client -> Server: `CT#{name}#{message}#%`
 *   Server -> Client: `CT#{name}#{message}#{is_from_server}#%` (is_from_server optional)
 *
 * `is_from_server` is therefore only meaningful on incoming packets; if it is
 * defined when encoding, the server-form (with the trailing flag) is emitted.
 *
 * String fields hold logical (unescaped) values -- the codec handles
 * FantaCode escape/unescape so handlers never see `<num>` / `<and>` / etc.
 */


const { mode } = queryParser();

/**
 * Handles an out-of-character chat message.
 */
export const appendOOCMessage = (packet: aolib.Out<typeof aolib.CTBroadcast>) => {
  if (mode !== "replay") {
    const oocLog = document.getElementById("client_ooclog")!;
    const username = safeHtmlTags(unescapeUnicode(packet.name));
    const rawMessage = safeHtmlTags(unescapeUnicode(packet.message));
    let message = addLinks(rawMessage);
    message = message.replace(/\n/g, "<br>");

    oocLog.innerHTML += `${username}: ${message}<br>`;
    if (oocLog.scrollTop + oocLog.offsetHeight + 120 > oocLog.scrollHeight)
      oocLog.scrollTo(0, oocLog.scrollHeight);

    flashPairActivity(rawMessage);
  }
};

function addLinks(message: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`,
  );
}

/**
 * Sends an out-of-character chat message.
 */