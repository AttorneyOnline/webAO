import type { MMPacket } from "../types/MM";

/**
 * Handles the "MusicMode" packet
 */
export const handleMM = (_packet: MMPacket) => {
  // It's unused nowadays, as preventing people from changing the music is now serverside
};
