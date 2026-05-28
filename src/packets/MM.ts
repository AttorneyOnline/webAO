import type { PacketCodec } from "../packets";

/**
 * "MusicMode" packet. Not in the official spec and unused by the current
 * client -- kept as a no-op codec for registry completeness.
 */
export type MMPacket = Record<string, never>;

export const MM: PacketCodec<MMPacket> = {
  header: "MM",
  decode() {
    return {};
  },
  encode() {
    return `MM#%`;
  },
};

/**
 * Handles the "MusicMode" packet
 */
export const receiveMM = (_packet: MMPacket) => {
  // It's unused nowadays, as preventing people from changing the music is now serverside
};
