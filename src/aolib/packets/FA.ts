/** FA (s2c) — full area list as a flat array of area names. */
import { packet } from "../schema";
import { str, array } from "../fields";

export const FA = packet("FA", {
  areas: array(str()),
});
