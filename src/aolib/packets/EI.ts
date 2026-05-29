/**
 * EI (s2c) — per-evidence info packet.
 *
 * `details` packs into one positional slot as
 * `name&description&type&image` — kept nested so the typed shape stays
 * flat-per-evidence and the inner `&` separators are model-owned, not
 * caller-owned.
 */
import { packet } from "../schema";
import { str, num, nested } from "../fields";

export const EI = packet("EI", {
  id: num(),
  details: nested({
    name: str(),
    description: str(),
    type: str(),
    image: str(),
  }),
});
