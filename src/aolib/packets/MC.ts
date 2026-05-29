/**
 * MC — music-change. Bidirectional: same header on the wire but the
 * client-sent and server-broadcast shapes differ slightly.
 *
 * Client → server (request): `{ name, char_id, showname?, effects? }`
 *   The client asks for a music change. `name` is the track filename,
 *   `char_id` identifies the requesting player.
 *
 * Server → client (broadcast): `{ name, char_id, showname?, looping?,
 *   channel?, effects? }`
 *   The server's broadcast carries everyone-needs-to-know fields the
 *   client doesn't send (looping flag, channel index).
 *
 * The session registries map header `MC` to whichever shape applies in
 * the relevant direction.
 */

import { packet } from "../schema";
import { str, num, bool, opt } from "../fields";

/** Client → server: a music change request. */
export const MCRequest = packet("MC", {
  name: str(),
  char_id: num(),
  showname: opt(str(), ""),
  effects: opt(num(), 0),
});

/** Server → client: a music change broadcast. */
export const MCBroadcast = packet("MC", {
  name: str(),
  char_id: num(),
  showname: opt(str(), ""),
  looping: opt(bool(), false),
  channel: opt(num(), 0),
  effects: opt(num(), 0),
});
