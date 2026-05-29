/**
 * MA (c2s) — moderator action against a player (mute / ban / kick).
 *
 * `duration` is in minutes; `0` means kick (no time-bound block).
 */
import { packet } from "../schema";
import { str, num } from "../fields";

export const MA = packet("MA", {
  id: num(),
  duration: num(),
  reason: str(),
});
