/**
 * TI (s2c) — timer update.
 *
 * `command`: 0 / 1 = set time, 2 = show, 3 = hide. `time` is in
 * milliseconds.
 */
import { packet } from "../schema";
import { num } from "../fields";

export const TI = packet("TI", {
  timer_id: num(),
  command: num(),
  time: num(),
});
