/**
 * Field primitives.
 *
 * A schema is a record of `Field`s. Each field has:
 *   - a `kind` tag the schema walker uses to decide how to handle it
 *   - a phantom type parameter `T` that the JSON walker in `./json`
 *     and `In<S>` / `Out<S>` recover via conditional inference
 *   - fanta codecs (`fromFanta`, `toFanta`) — fanta is positional with
 *     chat-escapes, so each field knows how to serialize ONE token.
 *
 * JSON serialization is NOT per-field. The library's JSON walker in
 * `./json` dispatches on `kind` and handles validation generically.
 * Custom fields can opt in to JSON codecs for rare cases.
 *
 * Seven primitives cover every AO packet shape we've encountered:
 *
 *   str() / num() / bool()    required scalar (leaf kinds)
 *   opt(inner, default)       optional with default (wrapper)
 *   lit(value)                wire-only literal (hidden from caller)
 *   nested(subfields, sep?)   nested object; in fanta, sub-fields packed
 *                             into one positional slot with a separator;
 *                             in JSON, a native nested object
 *   array(element)            variable-length list; in fanta, consumes
 *                             all remaining positional slots; in JSON, a
 *                             native array
 *   custom({...})             escape hatch for one-off shapes
 *
 * Direction asymmetry (e.g. MS): two schemas, same header, different
 * fields. The library's registries put each in the correct namespace.
 */

// ---------------------------------------------------------------------
// Internal: AO1 chat-escape helpers. Dependency-free; if a sibling
// module starts needing them, factor out.
// ---------------------------------------------------------------------

function escapeFanta(s: string): string {
  return s
    .replaceAll("#", "<num>")
    .replaceAll("&", "<and>")
    .replaceAll("%", "<percent>")
    .replaceAll("$", "<dollar>");
}

function unescapeFanta(s: string): string {
  return s
    .replaceAll("<num>", "#")
    .replaceAll("<and>", "&")
    .replaceAll("<percent>", "%")
    .replaceAll("<dollar>", "$");
}

function unescapeUnicode(s: string): string {
  return s.replace(/\\u([\d\w]{1,})/gi, (_m, g) =>
    String.fromCharCode(parseInt(g, 16)),
  );
}

// ---------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------

/**
 * Granular discriminator. Each leaf primitive carries its own kind
 * so the JSON walker can dispatch without per-field methods.
 */
export type FieldKind =
  | "string" | "number" | "boolean"
  | "optional" | "literal"
  | "nested" | "array"
  | "custom";

/**
 * Base field interface. `kind` + the fanta codecs are common to every
 * field. Specific shapes (optional, literal, nested, array, custom)
 * extend this with their own metadata.
 *
 * The phantom `__t` is what lets `In<S>` / `Out<S>` (and the JSON
 * walker's typed return) recover the value type via `infer T`. Never
 * set at runtime.
 */
export interface Field<T> {
  readonly kind: FieldKind;
  readonly __t?: T;

  /** Parse one fanta positional token into a typed value. */
  fromFanta(token: string, name: string): T;
  /** Serialize a typed value into one fanta positional token. */
  toFanta(value: T): string;
}

export interface ScalarField<T> extends Field<T> {
  readonly kind: "string" | "number" | "boolean";
}

export interface OptionalField<T> extends Field<T> {
  readonly kind: "optional";
  readonly inner: Field<T>;
  readonly default: T;
}

export interface LiteralField<T> extends Field<T> {
  readonly kind: "literal";
  readonly value: T;
}

/**
 * Derives the value type of a nested field from its sub-fields' value
 * types — same pattern `In<S>` will use over a whole schema.
 */
export type NestedValue<S extends Record<string, Field<unknown>>> = {
  [K in keyof S]: S[K] extends Field<infer V> ? V : never;
};

export interface NestedField<S extends Record<string, Field<unknown>>>
  extends Field<NestedValue<S>>
{
  readonly kind: "nested";
  readonly subfields: S;
  /** Fanta-only: separator between sub-tokens. JSON ignores this. */
  readonly separator: string;
}

/**
 * `ArrayField` is parameterised by the element FIELD (not just its
 * value type), so `In<S>` / `Out<S>` can recurse into the element's
 * structure — e.g. `array(nested({...}))` produces a typed array of
 * typed nested objects, not `Array<unknown>`.
 */
export interface ArrayField<E extends Field<unknown>> extends Field<unknown[]> {
  readonly kind: "array";
  readonly element: E;
}

export interface CustomField<T> extends Field<T> {
  readonly kind: "custom";
  /** Optional JSON hook. If absent, the library's JSON walker uses identity. */
  fromJson?(value: unknown, name: string): T;
  /** Optional JSON hook. If absent, the library's JSON walker uses identity. */
  toJson?(value: T): unknown;
}

// ---------------------------------------------------------------------
// Public constructors
// ---------------------------------------------------------------------

/** Required string field. Caller must provide a value. */
export function str(): ScalarField<string> {
  return {
    kind: "string",
    fromFanta: (token) => unescapeUnicode(unescapeFanta(token)),
    toFanta: (value) => escapeFanta(value),
  };
}

/** Required number field. Strict: empty / NaN tokens throw. */
export function num(): ScalarField<number> {
  return {
    kind: "number",
    fromFanta: (token, name) => {
      // `Number("")` returns 0, masking an empty token. Reject explicitly.
      if (token === "") {
        throw new Error(`Invalid number for field '${name}': empty token`);
      }
      const n = Number(token);
      if (Number.isNaN(n)) {
        throw new Error(
          `Invalid number for field '${name}': ${JSON.stringify(token)}`,
        );
      }
      return n;
    },
    toFanta: (value) => String(value),
  };
}

/** Required boolean field. Fanta wire is `"0"` or `"1"` exactly. */
export function bool(): ScalarField<boolean> {
  return {
    kind: "boolean",
    fromFanta: (token, name) => {
      if (token !== "0" && token !== "1") {
        throw new Error(
          `Invalid boolean for field '${name}': expected "0" or "1", got ${JSON.stringify(token)}`,
        );
      }
      return token === "1";
    },
    toFanta: (value) => (value ? "1" : "0"),
  };
}

/**
 * Mark a field as optional with a default. The walker fills the default
 * if the caller omits the field (and on decode, if the wire omits it).
 * Codecs are inherited from the inner field; `inner` is exposed so the
 * JSON walker can recurse for validation.
 */
export function opt<T>(inner: Field<T>, defaultValue: T): OptionalField<T> {
  return {
    kind: "optional",
    fromFanta: inner.fromFanta,
    toFanta: inner.toFanta,
    inner,
    default: defaultValue,
  };
}

/**
 * Wire-only positional literal — `lit(0)` for CC's leading `0`,
 * `lit("CID")` for PV's padding token. The library emits `value` at this
 * field's position on encode and ignores whatever the wire delivers
 * there on decode. `In<S>` and `Out<S>` strip this field, so it never
 * appears on the caller-facing API. Doesn't appear in JSON envelopes
 * either — JSON is keyed and has no use for positional padding.
 */
export function lit<T extends string | number | boolean>(
  value: T,
): LiteralField<T> {
  const inner =
    typeof value === "string" ? str()
    : typeof value === "number" ? num()
    : bool();
  return {
    kind: "literal",
    fromFanta: inner.fromFanta as Field<T>["fromFanta"],
    toFanta: inner.toFanta as Field<T>["toFanta"],
    value,
  };
}

/**
 * Nested object field. In fanta, sub-fields are packed into one
 * positional slot, joined by `separator` (default `&`). In JSON, the
 * value is a native nested object keyed by the sub-field names.
 *
 * The cross-format concept is "this field's value is a nested object."
 * Only the fanta wire treats it specially (positional packing); the
 * JSON wire just writes it as the typed nested value.
 *
 * Example: `offset: nested({ x: num(), y: num() })`
 *   fanta wire token: `5&3`
 *   JSON value:       `{ "x": 5, "y": 3 }`
 */
export function nested<S extends Record<string, Field<unknown>>>(
  subfields: S,
  separator: string = "&",
): NestedField<S> {
  const keys = Object.keys(subfields);
  return {
    kind: "nested",
    subfields,
    separator,
    fromFanta(token, name) {
      const parts = token.split(separator);
      const result: Record<string, unknown> = {};
      keys.forEach((k, i) => {
        result[k] = subfields[k].fromFanta(parts[i] ?? "", `${name}.${k}`);
      });
      return result as NestedValue<S>;
    },
    toFanta(value) {
      return keys
        .map((k) =>
          subfields[k].toFanta((value as Record<string, unknown>)[k]),
        )
        .join(separator);
    },
  };
}

/**
 * Variable-length list field. In fanta, an array consumes all remaining
 * positional slots (greedy) — so an array field must be at the END of
 * the schema, and only one array field per schema. In JSON, it's a
 * native array of typed elements.
 *
 * For multiple arrays in one packet (rare), use a schema-level
 * `toArgs`/`fromArgs` override.
 *
 * The library's fanta walker special-cases arrays: it consumes the
 * remaining args and maps `element.fromFanta` over each. The
 * `fromFanta` / `toFanta` methods on the ArrayField itself throw —
 * they're not meant to be called directly.
 *
 * Example: `music_list: array(str())` (FM)
 *   fanta wire: `FM#track1#track2#track3#%`
 *   JSON value: `["track1", "track2", "track3"]`
 *
 * Or with nested elements: `peers: array(nested({uid: num(), name: str()}))`
 *   fanta wire: `VS_PEERS#1&Alice#2&Bob#%`
 *   JSON value: `[{uid: 1, name: "Alice"}, {uid: 2, name: "Bob"}]`
 */
export function array<E extends Field<unknown>>(element: E): ArrayField<E> {
  const reject = (name: string): never => {
    throw new Error(
      `array field '${name}' must be consumed by the schema walker — its ` +
      `per-token codecs are not callable directly. The fanta walker takes ` +
      `the remaining args and maps element.fromFanta over each.`,
    );
  };
  return {
    kind: "array",
    element,
    fromFanta: (_token, name) => reject(name) as unknown[],
    toFanta: () => reject("(toFanta)") as string,
  };
}

/**
 * Escape hatch for fields that don't fit any of the primitives. Define
 * the fanta codecs directly. JSON codecs are optional — if absent, the
 * library's JSON walker uses identity (the typed value IS the JSON
 * value, which is the right default for AO-spec'd types).
 *
 * Most schemas should never need this — prefer adding a new primitive
 * if a pattern reappears across packets.
 */
export function custom<T>(codecs: {
  toFanta(value: T): string;
  fromFanta(token: string, name: string): T;
  toJson?(value: T): unknown;
  fromJson?(value: unknown, name: string): T;
}): CustomField<T> {
  return {
    kind: "custom",
    ...codecs,
  };
}
