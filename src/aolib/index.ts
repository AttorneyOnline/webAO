/**
 * Public entry point for aolib.
 *
 * Layers, top-down:
 *   - session: `server(config)` / `client(config)` — the role-typed
 *     dispatch surface. Most callers only need these.
 *   - schemas: each AO packet has a typed schema; both the constants
 *     and the direction-keyed registries are re-exported below.
 *   - encode / decode / cast: the wire-format primitives the session
 *     layer drives. Exposed so library consumers can implement their
 *     own dispatcher if they need to bypass the session abstraction.
 *   - fields: the schema-building DSL (`str`, `num`, `opt`, etc.).
 *   - types: `In<S>` / `Out<S>` for callers writing their own typed
 *     wrappers.
 *   - jsonSchema: `toJsonSchema(schema)` for documentation export.
 */

// ---------------------------------------------------------------------
// Session: the main public surface.
// ---------------------------------------------------------------------

export {
  server,
  client,
  type SessionConfig,
  type ServerSession,
  type ClientSession,
} from "./session";

import { server, client } from "./session";

/**
 * Convenience namespace so both `import { server, client }` and
 * `import { aolib }` styles work.
 */
export const aolib = { server, client };

// ---------------------------------------------------------------------
// Packet schemas.
//
// Direction-keyed registries are the source of truth for which packets
// can flow which way; individual schema constants are re-exported for
// callers who want them by name.
// ---------------------------------------------------------------------

export {
  c2sSchemas,
  s2cSchemas,
  type C2SSchemas,
  type S2CSchemas,
  // unidirectional and symmetric-bidirectional schemas
  HI, CC, decryptor, ID, PV, BB, DONE, SM,
  HP, RT, ZZ,
  AE, AM, AN, askchaa, CH, DE, EE, MA, PE, RC, RD, RM, VS_FRAME,
  ASS, AUTH, BD, BN, CHECK, CharsCheck, FA, FL, FM, JD, KB, KK,
  PN, PR, PU, RMC, SC, SI, SP, TI,
  VS_AUDIO, VS_CAPS, VS_PEERS,
  CI, EM, EI, LE,
  // bidirectional asymmetric (per-direction shapes)
  MCRequest, MCBroadcast,
  MSRequest, MSBroadcast,
  CTRequest, CTBroadcast,
  VSJoinRequest, VSJoinBroadcast,
  VSLeaveRequest, VSLeaveBroadcast,
  VSSpeakRequest, VSSpeakBroadcast,
  // MS enums (public type surface for chat fields)
  Side,
  DeskModifier,
  EmoteModifier,
  ShoutModifier,
  Flip,
  TextColor,
  isFullView,
  type Offset,
} from "./packets";

// ---------------------------------------------------------------------
// Field primitives (schema DSL).
// ---------------------------------------------------------------------

export {
  str,
  num,
  bool,
  opt,
  lit,
  nested,
  array,
  custom,
  type Field,
  type FieldKind,
  type ScalarField,
  type OptionalField,
  type LiteralField,
  type NestedField,
  type NestedValue,
  type ArrayField,
  type CustomField,
} from "./fields";

// ---------------------------------------------------------------------
// Wire-format primitives.
// ---------------------------------------------------------------------

export { encode, type WireMode } from "./encode";
export { decode, readHeader } from "./decode";
export { cast } from "./cast";

// Per-field walkers (lower-level — most callers won't need these).
export { fromJson, toJson } from "./json";
export { fromFantaArgs, toFantaArgs } from "./fanta";

// ---------------------------------------------------------------------
// Type-level walkers — `In<S>` (caller input shape) and `Out<S>`
// (decoded output shape). The only types client code should reach for.
// ---------------------------------------------------------------------

export type {
  In,
  Out,
  InFields,
  OutFields,
  FieldInValue,
  FieldOutValue,
} from "./types";

// ---------------------------------------------------------------------
// JSON Schema export for documentation / cross-language interop.
// ---------------------------------------------------------------------

export { toJsonSchema } from "./jsonSchema";

// ---------------------------------------------------------------------
// Schema builder.
// ---------------------------------------------------------------------

export {
  packet,
  type Fields,
  type Schema,
  type SchemaOverrides,
} from "./schema";
