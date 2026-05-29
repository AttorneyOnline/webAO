/**
 * PN (s2c) — server info (player count and description).
 *
 * `server_description` is legacy-optional; aolib canonicalises absent
 * to empty string.
 */
import { packet } from "../schema";
import { str, num, opt } from "../fields";

export const PN = packet("PN", {
  player_count: num(),
  max_players: num(),
  server_description: opt(str(), ""),
});
