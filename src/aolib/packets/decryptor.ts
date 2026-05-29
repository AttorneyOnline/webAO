/**
 * decryptor (s2c) — server's first packet to a connecting client.
 *
 * Historically the server-side of an AO2 encryption handshake; the
 * `value` field is the key the client should use.  In modern (FANTA)
 * deployments the value is a sentinel: `FANTA` means stay on the
 * positional wire, `JSON` means flip both sides to the JSON envelope.
 *
 * Mode-flip is implemented session-side: when the receive dispatcher
 * sees `{ value: "JSON" }` for the `decryptor` header it sets the
 * session's outbound wire mode to "json".
 */

import { packet } from "../schema";
import { str } from "../fields";

export const decryptor = packet("decryptor", {
  value: str(),
});
