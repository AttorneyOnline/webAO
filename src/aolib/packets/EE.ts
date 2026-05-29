/**
 * EE (c2s) — edit an existing evidence item. Server broadcasts the
 * updated list back as LE.
 */
import { packet } from "../schema";
import { str, num } from "../fields";

export const EE = packet("EE", {
  id: num(),
  name: str(),
  description: str(),
  image: str(),
});
