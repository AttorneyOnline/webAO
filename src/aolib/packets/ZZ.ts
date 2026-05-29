/**
 * ZZ — modcall. Bidirectional, identical shape.
 *
 * `target` is a non-spec AO2 extension carrying the targeted player
 * id (or `-1` for "any mod"). Defaults to `-1`.
 */
import { packet } from "../schema";
import { str, num, opt } from "../fields";

export const ZZ = packet("ZZ", {
  reason: str(),
  target: opt(num(), -1),
});
