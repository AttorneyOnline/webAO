/**
 * SP (s2c) — side / position change. `side` is one of the AO position
 * string codes (`def`, `pro`, `wit`, `jud`, etc.); we expose it as
 * the `Side` enum from MS for consistency with the rest of the chat
 * surface.
 */
import { packet } from "../schema";
import { custom, type CustomField } from "../fields";
import { Side } from "./MS";

const KNOWN_SIDES = new Set<string>(Object.values(Side));
const parseSide = (s: string): Side => {
  const lower = s.toLowerCase();
  return KNOWN_SIDES.has(lower) ? (lower as Side) : Side.WITNESS;
};

const sideField = (): CustomField<Side> =>
  custom<Side>({
    fromFanta: (token) => parseSide(token),
    toFanta: (value) => value,
    fromJson: (value) => parseSide(String(value)),
    toJson: (value) => value,
  });

export const SP = packet("SP", {
  side: sideField(),
});
