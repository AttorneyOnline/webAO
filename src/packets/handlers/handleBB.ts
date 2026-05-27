import type { BBPacket } from "../types/BB";

/**
 * Handles the warning packet
 * on client this spawns a message box you can't close for 2 seconds
 */
export const handleBB = (packet: BBPacket) => {
  alert(packet.message);
};
