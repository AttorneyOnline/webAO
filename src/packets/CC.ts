import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Wire format: `CC#0#{char_id}#{char_pw}#%` — the leading `0` is a hardcoded
 * literal in the spec. webAO's existing senders use `CC#{playerID}#{char_id}#web#%`
 * (deviating from spec), so we keep an explicit `player_id` field as well.
 */
export interface CCPacket {
  player_id: number;
  char_id: number;
  char_pw?: string;
}

export const CC: PacketCodec<CCPacket> = {
  header: "CC",
  decode(args) {
    const packet: CCPacket = {
      player_id: Number(args[1]),
      char_id: Number(args[2]),
    };
    if (args[3] !== undefined) {
      packet.char_pw = unescapeChat(args[3]);
    }
    return packet;
  },
  encode(packet) {
    if (packet.char_pw !== undefined) {
      return `CC#${packet.player_id}#${packet.char_id}#${escapeChat(packet.char_pw)}#%`;
    }
    return `CC#${packet.player_id}#${packet.char_id}#%`;
  },
};

/**
 * What? you want a character??
 */
export const receiveCC = (packet: CCPacket) => {
  client.sendToSelf(`PV#1#CID#${packet.char_id}#%`);
};

/**
 * Requests to play as a specified character. Gatekeeps unknown
 * `char_id`s so we don't ask the server for a slot that isn't real.
 */
export const sendCC = (packet: CCPacket) => {
  if (packet.char_id !== -1 && !client.chars[packet.char_id]?.name) return;
  client.sendPacketToServer(CC, packet);
};
