/**
 * ID (s2c) — server identifies its software and version to the client.
 *
 * Sent in response to `HI`. The client uses this to gate version-
 * sensitive features; `player_count` is purely informational.
 */

import { packet } from "../schema";
import { str, num } from "../fields";

export const ID = packet("ID", {
  player_count: num(),
  software: str(),
  version: str(),
});
