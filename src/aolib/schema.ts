/**
 * Schema definition.
 *
 * A schema is the source of truth for one packet: its header, its
 * ordered field definitions, and (optionally) overrides for the fanta
 * positional args step when wire-format quirks don't fit the field
 * primitives.
 *
 * Schemas are pure data — the library walks them at runtime, and
 * mapped types in `./types` walk them at compile time. The two cannot
 * disagree because they read the same source.
 *
 * Each packet file under `./packets/` exports one (or two, for
 * direction-asymmetric packets) `Schema` literal constructed via
 * `packet(...)`.
 *
 * Direction (c2s / s2c) is not stored on the schema — it's metadata
 * carried by the registries in `./packets/index.ts` that organise
 * schemas into `ServerSession.send.*`, `ClientSession.on.*`, and so
 * on. A schema literal doesn't care which direction it'll be used in.
 */

import type { Field } from "./fields";

/**
 * A schema's field record: keys are field names, values are typed
 * field primitives. Phantom value types on each `Field<T>` let the
 * type-level walkers (`In<S>`, `Out<S>` in `./types`) recover per-key
 * value types via `infer T`.
 */
export type Fields = Record<string, Field<unknown>>;

/**
 * Optional per-schema overrides for the fanta positional args step.
 *
 * The library always handles wire framing (`HEADER#…#%`), terminator
 * peeling, header reading, JSON envelope, and the required-field
 * gauntlet (`cast` fills defaults or throws). Only the args-list step
 * is overridable — and only on the fanta path. JSON keyed envelopes
 * sidestep positional weirdness by design and don't dispatch through
 * these hooks.
 *
 * `toArgs` receives the post-cast packet (defaults filled, required
 * validated) and returns the ordered string args. The library frames
 * them as `HEADER#a#b#…#%`.
 *
 * `fromArgs` receives the args (header peeled, terminator stripped)
 * and returns whatever fields it can extract — `cast` then runs over
 * the result to fill defaults and validate required.
 *
 * Type parameters loose (`unknown`) here. Tighter typing comes in
 * `./types` once `In<S>` / `Out<S>` exist.
 */
export interface SchemaOverrides {
  toArgs?: (packet: unknown) => string[];
  fromArgs?: (args: string[]) => Record<string, unknown>;
}

/**
 * A packet schema. The output of `packet(...)`.
 */
export interface Schema<F extends Fields = Fields> extends SchemaOverrides {
  readonly $header: string;
  readonly fields: F;
}

/**
 * Construct a packet schema.
 *
 * ```ts
 * export const MC = packet("MC", {
 *   name: str(),
 *   char_id: num(),
 *   showname: opt(str(), ""),
 *   effects: opt(num(), 0),
 * });
 * ```
 *
 * For packets with wire-format quirks the primitives can't express,
 * pass `toArgs` / `fromArgs` overrides that the fanta path dispatches
 * to instead of the default args-list walker:
 *
 * ```ts
 * export const CC = packet("CC", {
 *   char_id: num(),
 * }, {
 *   toArgs:   (p) => ["0", String((p as { char_id: number }).char_id), ""],
 *   fromArgs: (args) => args[1] !== undefined ? { char_id: Number(args[1]) } : {},
 * });
 * ```
 *
 * The override bodies are untyped at this layer because `Fields` is
 * generic over its keys. Tighter typing comes once `./types` exports
 * the per-schema `In`/`Out` mapped types — until then, write the
 * overrides with explicit casts inside.
 */
export function packet<F extends Fields>(
  header: string,
  fields: F,
  overrides?: SchemaOverrides,
): Schema<F> {
  return {
    $header: header,
    fields,
    ...(overrides ?? {}),
  };
}
