/**
 * PE (c2s) — add an evidence item. Server broadcasts the updated list
 * back as LE.
 */
import { packet } from "../schema";
import { str } from "../fields";

export const PE = packet("PE", {
  name: str(),
  description: str(),
  image: str(),
});
