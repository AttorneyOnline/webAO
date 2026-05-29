/**
 * CharsCheck (s2c) — character-slot occupancy bitmask. Each element
 * is `0` (vacant) or `1` (taken); the index is the char id.
 */
import { packet } from "../schema";
import { num, array } from "../fields";

export const CharsCheck = packet("CharsCheck", {
  taken: array(num()),
});
