import type { PacketCodec } from "../packets";

/**
 * Obsolete FantaCrypt initialization marker. Modern servers advertise
 * `noencryption` in `FL` and never send this, but it remains registered as
 * a no-op so legacy traffic doesn't trip the unknown-header warning.
 */
export type DecryptorPacket = Record<string, never>;

export const decryptor: PacketCodec<DecryptorPacket> = {
  decode: () => ({}),
};

export const receivedecryptor = () => {};
