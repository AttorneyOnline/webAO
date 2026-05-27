import { resetICParams } from "../../client/resetICParams";
import type { AckMSPacket } from "../types/ackMS";

/**
 * server got our message
 */
export const handleackMS = (_packet: AckMSPacket) => {
  resetICParams();
};
