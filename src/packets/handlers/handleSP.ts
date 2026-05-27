import { updateActionCommands } from "../../dom/updateActionCommands";
import type { SPPacket } from "../types/SP";

/**
 * position change
 */
export const handleSP = (packet: SPPacket) => {
  updateActionCommands(packet.side);
};
