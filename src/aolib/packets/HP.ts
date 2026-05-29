/**
 * HP — health-bar update. Bidirectional with identical shape; the same
 * schema is registered in both directions.
 *
 * `bar`: 1 = defense, otherwise prosecution.
 * `value`: integer 0..10 (current code maps via `value * 10` to a %).
 */
import { packet } from "../schema";
import { num } from "../fields";

export const HP = packet("HP", {
  bar: num(),
  value: num(),
});
