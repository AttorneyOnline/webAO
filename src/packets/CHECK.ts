import type { PacketCodec } from "../packets";

/**
 * Server keepalive response to the client's `CH`. No fields, no action.
 */
export type CHECKPacket = Record<string, never>;

export const CHECK: PacketCodec<CHECKPacket> = {
  decode: () => ({}),
  encode: () => "CHECK#%",
};

export const handleCHECK = () => {};
