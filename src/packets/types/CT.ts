import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

/**
 * OOC chat message. The wire format differs by direction:
 *   Client -> Server: `CT#{name}#{message}#%`
 *   Server -> Client: `CT#{name}#{message}#{is_from_server}#%` (is_from_server optional)
 *
 * `isFromServer` is therefore only meaningful on incoming packets; if it is
 * defined when encoding, the server-form (with the trailing flag) is emitted.
 *
 * String fields hold logical (unescaped) values -- the codec handles
 * FantaCode escape/unescape so handlers never see `<num>` / `<and>` / etc.
 */
export interface CTPacket {
  name: string;
  message: string;
  isFromServer?: boolean;
}

export const CT: PacketCodec<CTPacket> = {
  decode(args) {
    const packet: CTPacket = {
      name: unescapeChat(args[1] ?? ""),
      message: unescapeChat(args[2] ?? ""),
    };
    if (args[3] !== undefined) {
      packet.isFromServer = args[3] === "1";
    }
    return packet;
  },
  encode(packet) {
    const name = escapeChat(packet.name);
    const message = escapeChat(packet.message);
    if (packet.isFromServer !== undefined) {
      return `CT#${name}#${message}#${packet.isFromServer ? 1 : 0}#%`;
    }
    return `CT#${name}#${message}#%`;
  },
};
