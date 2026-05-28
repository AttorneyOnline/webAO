import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Wire format: `CC#0#{char_id}#{char_pw}#%` — the leading `0` is a hardcoded
 * literal in the spec. webAO's existing senders use `CC#{playerID}#{char_id}#web#%`
 * (deviating from spec), so we keep an explicit `playerId` field as well.
 */
export interface CCPacket {
  playerId: number;
  charId: number;
  charPw?: string;
}

export const CC: PacketCodec<CCPacket> = {
  header: "CC",
  decode(args) {
    const packet: CCPacket = {
      playerId: Number(args[1]),
      charId: Number(args[2]),
    };
    if (args[3] !== undefined) {
      packet.charPw = unescapeChat(args[3]);
    }
    return packet;
  },
  encode(packet) {
    if (packet.charPw !== undefined) {
      return `CC#${packet.playerId}#${packet.charId}#${escapeChat(packet.charPw)}#%`;
    }
    return `CC#${packet.playerId}#${packet.charId}#%`;
  },
};

/**
 * What? you want a character??
 */
export const receiveCC = (packet: CCPacket) => {
  client.sendToSelf(`PV#1#CID#${packet.charId}#%`);
};

/**
 * Requests to play as a specified character. Gatekeeps unknown
 * `charId`s so we don't ask the server for a slot that isn't real.
 */
export const sendCC = (packet: CCPacket) => {
  if (packet.charId !== -1 && !client.chars[packet.charId]?.name) return;
  client.sendPacketToServer(CC, packet);
};
