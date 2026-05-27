import type { PacketCodec } from "./index";

/**
 * "MusicMode" packet. Not in the official spec and unused by the current
 * client -- kept as a no-op codec for registry completeness.
 */
export type MMPacket = Record<string, never>;

export const MM: PacketCodec<MMPacket> = {
  decode() {
    return {};
  },
  encode() {
    return `MM#%`;
  },
};
