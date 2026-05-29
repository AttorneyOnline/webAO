/**
 * LE (s2c) — full evidence list as an array of nested entries.
 * Each entry packs into one positional slot as `name&description&image`.
 */
import { packet } from "../schema";
import { str, nested, array } from "../fields";

export const LE = packet("LE", {
  evidence: array(nested({
    name: str(),
    description: str(),
    image: str(),
  })),
});
