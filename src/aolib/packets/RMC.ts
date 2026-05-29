/**
 * RMC (s2c) — music offset / seek command. `toTime` is a seconds
 * string passed directly to the audio element's `currentTime`.
 */
import { packet } from "../schema";
import { str } from "../fields";

export const RMC = packet("RMC", {
  toTime: str(),
});
