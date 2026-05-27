import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Mod-action packet (mute/ban). Client-to-server only.
 */
export interface MAPacket {
  id: number;
  /** Length in minutes. Use 0 for a kick. */
  length: number;
  reason: string;
}

export const MA: PacketCodec<MAPacket> = {
  decode: (args) => ({
    id: Number(args[1]),
    length: Number(args[2]),
    reason: unescapeChat(args[3] ?? ""),
  }),
  encode: (p) => `MA#${p.id}#${p.length}#${escapeChat(p.reason)}#%`,
};

export const sendMA = (packet: MAPacket) => {
  client.sendToServer(MA.encode(packet));
};
