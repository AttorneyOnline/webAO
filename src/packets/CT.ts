import { unescapeUnicode, safeHtmlTags } from "../escaping";
import queryParser from "../utils/queryParser";
import { flashPairActivity } from "../dom/pairNotification";
import type * as aolib from "../aolib";

const { mode } = queryParser();

/** Append an OOC chat message to the log. */
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

function addLinks(message: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`,
  );
}
