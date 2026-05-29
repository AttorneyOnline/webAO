/**
 * Direction-keyed schema registries.
 *
 * `c2sSchemas` — packets a client sends and a server receives.
 * `s2cSchemas` — packets a server sends and a client receives.
 *
 * The same header may exist in both maps (e.g. `MC` is bidirectional)
 * with different field shapes per direction; that's fine — the session
 * factories pick the right map based on role.
 *
 * The wrong-direction guard is the literal absence of a header from a
 * given map: if `headers in s2cSchemas` is false on a `ClientSession`
 * `.send.<header>`, the proxy throws a role-aware error.
 *
 * `const` assertions preserve the literal type of each key for the
 * mapped types in `session.ts`.
 */

import { HI } from "./HI";
import { CC } from "./CC";
import { MCRequest, MCBroadcast } from "./MC";

import { decryptor } from "./decryptor";
import { ID } from "./ID";
import { PV } from "./PV";
import { BB } from "./BB";
import { DONE } from "./DONE";
import { SM } from "./SM";

export const c2sSchemas = {
  HI,
  CC,
  MC: MCRequest,
} as const;

export const s2cSchemas = {
  decryptor,
  ID,
  PV,
  BB,
  DONE,
  SM,
  MC: MCBroadcast,
} as const;

export type C2SSchemas = typeof c2sSchemas;
export type S2CSchemas = typeof s2cSchemas;

// Re-export schema constants individually for consumers who want to
// `aolib.HI` / `aolib.MCRequest` directly without going through a map.
export { HI, CC, MCRequest, MCBroadcast, decryptor, ID, PV, BB, DONE, SM };
