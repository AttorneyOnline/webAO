/**
 * PU (s2c) — player list field update.
 *
 * `type`: 0 = name, 1 = char name, 2 = showname, 3 = area. `data`
 * carries the new value for that field for player `id`.
 */
import { packet } from "../schema";
import { str, num } from "../fields";

export const PU = packet("PU", {
  id: num(),
  type: num(),
  data: str(),
});
