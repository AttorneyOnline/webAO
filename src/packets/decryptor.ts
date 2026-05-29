import { client, setJsonMode } from "../client";
import { Packet } from "../Packet";
import { decode, req } from "../packets";

/**
 * Obsolete FantaCrypt initialization marker. Modern servers advertise
 * `noencryption` in `FL` and never send this in its original role.
 *
 * Repurposed as the wire-format negotiation + handshake-trigger
 * packet: when `value === "JSON"` the client flips into JSON wire
 * mode; either way we send `HI` to begin the handshake (deferred
 * until now so the format choice is settled first).
 */

// Receiver: Client
export class DecryptorPacket extends Packet {
  static $header = "decryptor";
  value: string = req("string");
}

export function receivedecryptor(body: string) {
  const packet = decode(DecryptorPacket, body);
  if (packet.value === "JSON") {
    setJsonMode(true);
  }
  client.joinServer();
}
