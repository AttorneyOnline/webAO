/** PR (s2c) — player roster change. `type` is 0 = join, 1 = leave. */
import { packet } from "../schema";
import { num } from "../fields";

export const PR = packet("PR", {
  id: num(),
  type: num(),
});
