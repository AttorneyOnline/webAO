/**
 * Type-level walkers: `In<S>` and `Out<S>`.
 *
 * `In<S>` is the input shape — what a caller passes to send. Required
 * fields are required, optional fields are optional, wire-only
 * literals are stripped, nested objects and arrays keep their typed
 * structure recursively.
 *
 * `Out<S>` is the decoded output shape — what `fromJson` (or the fanta
 * walker) returns. Same as `In<S>` except optional fields lose their
 * `?` because `cast` has already filled defaults at runtime. Literals
 * are still stripped.
 *
 * Both mapped types descend through wrappers and composites, so:
 *
 *   nested({ x: num(), y: opt(num(), 0) })
 *     In  → { x: number; y?: number }
 *     Out → { x: number; y: number }
 *
 *   array(nested({ uid: num(), name: str() }))
 *     In  → { uid: number; name: string }[]
 *     Out → { uid: number; name: string }[]
 *
 * The phantom `__t?: T` on `Field<T>` is what these walkers infer
 * through. The runtime never sees these types.
 */

import type {
  Field,
  OptionalField,
  LiteralField,
  NestedField,
  ArrayField,
} from "./fields";
import type { Fields, Schema } from "./schema";

// ---------------------------------------------------------------------
// Per-field value type derivation.
//
// Recurses into the *structure* of nested and array fields so the
// resulting type reflects the typed shape all the way down. For
// optionals and literals, returns the inner value type — the
// optional/literal handling happens at the mapped-type level (in
// `InFields` / `OutFields`), not here.
// ---------------------------------------------------------------------

/** Value type a sender input slot has for the given field. */
export type FieldInValue<F> =
  F extends NestedField<infer S>
    ? InFields<S & Record<string, Field<unknown>>>
    : F extends ArrayField<infer E>
      ? E extends Field<unknown>
        ? FieldInValue<E>[]
        : never
      : F extends OptionalField<infer V>
        ? V
        : F extends LiteralField<infer V>
          ? V
          : F extends Field<infer T>
            ? T
            : never;

/** Value type a decoded output slot has for the given field. */
export type FieldOutValue<F> =
  F extends NestedField<infer S>
    ? OutFields<S & Record<string, Field<unknown>>>
    : F extends ArrayField<infer E>
      ? E extends Field<unknown>
        ? FieldOutValue<E>[]
        : never
      : F extends OptionalField<infer V>
        ? V
        : F extends LiteralField<infer V>
          ? V
          : F extends Field<infer T>
            ? T
            : never;

// ---------------------------------------------------------------------
// Mapped types over a fields record. Handle stripping (literals) and
// optionality (`opt(...)` becomes `?`).
//
// `InFields` and `OutFields` are the heart of the type system. `In<S>`
// and `Out<S>` at the schema level are just delegations.
// ---------------------------------------------------------------------

/** Caller input shape: required fields required, optionals optional, literals stripped. */
export type InFields<F extends Record<string, Field<unknown>>> =
  {
    [K in keyof F as F[K] extends LiteralField<unknown>
      ? never
      : F[K] extends OptionalField<unknown>
        ? never
        : K]: FieldInValue<F[K]>;
  } & {
    [K in keyof F as F[K] extends LiteralField<unknown>
      ? never
      : F[K] extends OptionalField<unknown>
        ? K
        : never]?: FieldInValue<F[K]>;
  };

/** Decoded output shape: all visible fields required (defaults filled), literals stripped. */
export type OutFields<F extends Record<string, Field<unknown>>> = {
  [K in keyof F as F[K] extends LiteralField<unknown>
    ? never
    : K]: FieldOutValue<F[K]>;
};

// ---------------------------------------------------------------------
// Schema-level entry points.
// ---------------------------------------------------------------------

/** Input type for a schema's sender. */
export type In<S> = S extends Schema<infer F> ? InFields<F> : never;

/** Output type for a schema's decoder. */
export type Out<S> = S extends Schema<infer F> ? OutFields<F> : never;

// ---------------------------------------------------------------------
// Worked examples for the type tester. These don't run at runtime —
// they're here so a future `tsc` regression surfaces a type drift
// immediately. Comment them out (or move to a tests file) once
// confidence is high.
// ---------------------------------------------------------------------

// import { packet } from "./schema";
// import { str, num, bool, opt, lit, nested, array } from "./fields";
//
// const MC_DEMO = packet("MC", {
//   name: str(),
//   char_id: num(),
//   showname: opt(str(), ""),
//   effects: opt(num(), 0),
// });
// type _InMC  = In<typeof MC_DEMO>;
// type _OutMC = Out<typeof MC_DEMO>;
// // _InMC  = { name: string; char_id: number; showname?: string; effects?: number }
// // _OutMC = { name: string; char_id: number; showname: string;  effects: number  }
//
// const CC_DEMO = packet("CC", {
//   _0: lit(0),
//   char_id: num(),
//   _pw: lit(""),
// });
// type _InCC  = In<typeof CC_DEMO>;   // = { char_id: number }
// type _OutCC = Out<typeof CC_DEMO>;  // = { char_id: number }
//
// const FOO_DEMO = packet("FOO", {
//   offset: nested({ x: num(), y: opt(num(), 0) }),
//   tags:   array(str()),
//   peers:  array(nested({ uid: num(), name: str() })),
// });
// type _InFoo = In<typeof FOO_DEMO>;
// // _InFoo = {
// //   offset: { x: number; y?: number };
// //   tags:   string[];
// //   peers:  { uid: number; name: string }[];
// // }
