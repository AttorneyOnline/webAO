/**
 * CC (c2s) — client requests a specific character slot.
 *
 * Wire shape is `CC#0#<char_id>##%` — a leading literal `0` (legacy
 * player-id slot the server ignores) and a trailing literal `""`
 * (legacy password slot). Both literals are stripped from the typed
 * API; callers only see `{ char_id }`.
 */

import { packet } from "../schema";
import { num, lit } from "../fields";

export const CC = packet("CC", {
  _0: lit(0),
  char_id: num(),
  _pw: lit(""),
});
