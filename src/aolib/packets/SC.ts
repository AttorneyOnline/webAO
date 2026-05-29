/**
 * SC (s2c) — full character list. Each element is a raw `&`-delimited
 * description string (name, description, etc.) that the client splits
 * itself; aolib keeps each slot as one opaque string to avoid
 * corrupting the inner separators.
 */
import { packet } from "../schema";
import { str, array } from "../fields";

export const SC = packet("SC", {
  char_data: array(str()),
});
