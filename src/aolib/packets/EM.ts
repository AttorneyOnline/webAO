/**
 * EM (s2c) — incremental music/area batch. Each entry is an
 * (index, track-or-area-name) pair packed into one positional slot.
 */
import { packet } from "../schema";
import { str, num, nested, array } from "../fields";

export const EM = packet("EM", {
  batchIndex: num(),
  entries: array(nested({ index: num(), name: str() })),
});
