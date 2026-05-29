/**
 * FL (s2c) — server feature flags. Standard flags include
 * `"yellowtext"`, `"cccc_ic_support"`, `"flipping"`, `"looping_sfx"`,
 * `"effects"`, `"y_offset"`. Clients negotiate available behavior
 * against this list.
 */
import { packet } from "../schema";
import { str, array } from "../fields";

export const FL = packet("FL", {
  features: array(str()),
});
