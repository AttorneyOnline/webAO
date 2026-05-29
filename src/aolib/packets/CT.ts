/**
 * CT — out-of-character chat. Bidirectional with asymmetric shapes:
 *
 *   Client → server: `{ name, message }`. No origin flag.
 *   Server → client: `{ name, message, is_from_server }`. The server
 *     marks broadcasts of its own messages (system / mod / etc.) with
 *     the trailing flag so clients can style them.
 *
 * Legacy server emitters sometimes omit `is_from_server` entirely;
 * aolib canonicalises absent to `false`.
 */
import { packet } from "../schema";
import { str, bool, opt } from "../fields";

/** Client → server: a chat message from the user. */
export const CTRequest = packet("CT", {
  name: str(),
  message: str(),
});

/** Server → client: a chat broadcast (possibly marked server-origin). */
export const CTBroadcast = packet("CT", {
  name: str(),
  message: str(),
  is_from_server: opt(bool(), false),
});
