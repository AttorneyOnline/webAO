import { client } from "../client";
import {
  decodeChat,
  escapeChat,
  safeTags,
  unescapeChat,
} from "../encoding";
import queryParser from "../utils/queryParser";
import { flashPairActivity } from "../dom/pairNotification";
import type { PacketCodec } from "../packets";

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
export interface CTPacket {
  name: string;
  message: string;
  is_from_server?: boolean;
}

export const CT: PacketCodec<CTPacket> = {
  header: "CT",
  decode(args) {
    const packet: CTPacket = {
      name: unescapeChat(args[1] ?? ""),
      message: unescapeChat(args[2] ?? ""),
    };
    if (args[3] !== undefined) {
      packet.is_from_server = args[3] === "1";
    }
    return packet;
  },
  encode(packet) {
    const name = escapeChat(packet.name);
    const message = escapeChat(packet.message);
    if (packet.is_from_server !== undefined) {
      return `CT#${name}#${message}#${packet.is_from_server ? 1 : 0}#%`;
    }
    return `CT#${name}#${message}#%`;
  },
};

const { mode } = queryParser();

/**
 * Handles an out-of-character chat message.
 */
export const receiveCT = (packet: CTPacket) => {
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

/**
 * Sends an out-of-character chat message.
 */
export const sendCT = (packet: CTPacket) => {
  client.sendPacket(CT, packet);
};
