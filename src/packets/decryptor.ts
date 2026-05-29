import { client, setJsonMode } from "../client";
import type { PacketCodec } from "../packets";

/**
 * Obsolete FantaCrypt initialization marker. Modern servers advertise
 * `noencryption` in `FL` and never send this in its original role.
 *
 * Repurposed as the wire-format negotiation + handshake-trigger packet:
 *   1. If `value === "JSON"`, we flip into JSON wire mode (encode + decode).
 *   2. Either way, we now send `HI` to begin the handshake. The client
 *      defers `HI` until this point so the format choice is settled
 *      before the first outgoing packet.
 *
 * Every modern server sends `decryptor` on client connect, so this is a
 * reliable handshake anchor.
 */
export interface DecryptorPacket {
  value: string;
}

export const decryptor: PacketCodec<DecryptorPacket> = {
  header: "decryptor",
  decode: (args) => ({ value: args[1] ?? "" }),
};

export const receivedecryptor = (packet: DecryptorPacket) => {
  if (packet.value === "JSON") {
    setJsonMode(true);
  }
  client.joinServer();
};
