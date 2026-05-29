/**
 * ASS (s2c) — asset origin update. The sentinel `"None"` means "keep
 * the current asset host"; any other value replaces it.
 */
import { packet } from "../schema";
import { str } from "../fields";

export const ASS = packet("ASS", {
  asset_url: str(),
});
