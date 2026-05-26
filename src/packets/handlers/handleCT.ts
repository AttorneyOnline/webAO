import queryParser from "../../utils/queryParser";
import { prepChat } from "../../encoding";
import { flashPairActivity } from "../../dom/pairNotification";
const { mode } = queryParser();

/**
 * Handles an out-of-character chat message.
 * @param {Array} args packet arguments
 */
export const handleCT = (args: string[]) => {
  if (mode !== "replay") {
    const oocLog = document.getElementById("client_ooclog")!;
    const username = prepChat(args[1]);
    const rawMessage = prepChat(args[2]);
    let message = addLinks(rawMessage);
    // Replace newlines with br
    message = message.replace(/\n/g, "<br>");

    oocLog.innerHTML += `${username}: ${message}<br>`;
    if (oocLog.scrollTop + oocLog.offsetHeight + 120 > oocLog.scrollHeight)
      oocLog.scrollTo(0, oocLog.scrollHeight);

    flashPairActivity(rawMessage);
  }
};

// If the incoming message contains a link, add a href hyperlink to it
function addLinks(message: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`,
  );
}
