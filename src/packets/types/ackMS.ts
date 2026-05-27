import type { PacketCodec } from "./index";

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
