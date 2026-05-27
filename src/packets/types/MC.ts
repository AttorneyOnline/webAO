import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

/**
 * Music/area change. The client form is `MC#{track}#{char_id}#%`, the server
 * form adds showname/looping/channel/effects. All trailing fields are
 * optional.
 */
export interface MCPacket {
  track: string;
  charId: number;
  showname?: string;
  looping?: number;
  channel?: number;
  effects?: number;
}

export const MC: PacketCodec<MCPacket> = {
  decode(args) {
    const packet: MCPacket = {
      track: unescapeChat(args[1] ?? ""),
      charId: Number(args[2]),
    };
    if (args[3] !== undefined) packet.showname = unescapeChat(args[3]);
    if (args[4] !== undefined) packet.looping = Number(args[4]);
    if (args[5] !== undefined) packet.channel = Number(args[5]);
    if (args[6] !== undefined) packet.effects = Number(args[6]);
    return packet;
  },
  encode(packet) {
    let out = `MC#${escapeChat(packet.track)}#${packet.charId}`;
    if (packet.showname !== undefined) out += `#${escapeChat(packet.showname)}`;
    if (packet.looping !== undefined) out += `#${packet.looping}`;
    if (packet.channel !== undefined) out += `#${packet.channel}`;
    if (packet.effects !== undefined) out += `#${packet.effects}`;
    return `${out}#%`;
  },
};
