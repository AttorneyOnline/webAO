import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

/**
 * Undocumented (not in the official Packet Reference). The legacy handler
 * uses `args[1]` as an offset/timestamp string passed directly to the audio
 * element, so we keep it as a raw string.
 */
export interface RMCPacket {
  // TODO: confirm field meaning -- the legacy handler stores this on
  // `music.totime` and adds it to `currentTime`, suggesting a seconds offset.
  toTime: string;
}

export const RMC: PacketCodec<RMCPacket> = {
  decode(args) {
    return { toTime: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `RMC#${escapeChat(packet.toTime)}#%`;
  },
};
