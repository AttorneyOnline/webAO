import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * Mod-action packet (mute/ban). Client-to-server only.
 */
export interface MAPacket {
  id: number;
  /** Duration in minutes. Use 0 for a kick. */
  duration: number;
  reason: string;
}

export const MA: PacketCodec<MAPacket> = {
  header: "MA",
  decode: (args) => ({
    id: Number(args[1]),
    duration: Number(args[2]),
    reason: unescapeChat(args[3] ?? ""),
  }),
  encode: (p) => `MA#${p.id}#${p.duration}#${escapeChat(p.reason)}#%`,
};

export const sendMA = (packet: MAPacket) => {
  client.sendPacket(MA, packet);
};
