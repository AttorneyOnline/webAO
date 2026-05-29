/**
 * PV (s2c) — server confirms a character pick for a player.
 *
 * Wire shape is `PV#<player_id>#CID#<char_id>#%` — `CID` is a literal
 * separator the original protocol uses to disambiguate the two numeric
 * slots. It's stripped from the typed API.
 */

import { packet } from "../schema";
import { num, lit } from "../fields";

export const PV = packet("PV", {
  player_id: num(),
  _cid: lit("CID"),
  char_id: num(),
});
