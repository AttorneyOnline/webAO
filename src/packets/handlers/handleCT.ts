import queryParser from "../../utils/queryParser";
import { decodeChat, safeTags } from "../../encoding";
import { flashPairActivity } from "../../dom/pairNotification";
import type { CTPacket } from "../types/CT";
const { mode } = queryParser();

/**
 * Handles an out-of-character chat message.
 */
export const handleCT = (packet: CTPacket) => {
  if (mode !== "replay") {
    const oocLog = document.getElementById("client_ooclog")!;
    const username = safeTags(decodeChat(packet.name));
    const rawMessage = safeTags(decodeChat(packet.message));
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
