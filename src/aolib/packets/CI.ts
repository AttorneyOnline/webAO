/**
 * CI (s2c) — incremental character info. `entries` is an array of
 * (index, raw-data) pairs; each `data` is an `&`-delimited blob the
 * receiver re-splits per character. aolib keeps `data` as one opaque
 * string to avoid corrupting the inner separators.
 *
 * Wire shape under aolib's nested encoding: each entry packs into one
 * positional slot as `index&data` (e.g. `CI#5#0&...#1&...#%`).
 */
import { packet } from "../schema";
import { str, num, nested, array } from "../fields";

export const CI = packet("CI", {
  batchIndex: num(),
  entries: array(nested({ index: num(), data: str() })),
});
