/**
 * SP (s2c) — side / position change. `side` is the Side enum's
 * numeric tag (see MS for the canonical mapping).
 */
import { packet } from "../schema";
import { num } from "../fields";

export const SP = packet("SP", {
  side: num(),
});
