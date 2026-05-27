import { resetICParams } from "../client/resetICParams";
import type { PacketCodec } from "../packets";

/**
 * Server acknowledgement of an MS the client sent. Undocumented; the handler
 * just resets IC params and ignores any payload.
 */
export type AckMSPacket = Record<string, never>;

export const ackMS: PacketCodec<AckMSPacket> = {
  decode() {
    return {};
  },
  encode() {
    return `ackMS#%`;
  },
};

/**
 * server got our message
 */
export const handleackMS = (_packet: AckMSPacket) => {
  resetICParams();
};
