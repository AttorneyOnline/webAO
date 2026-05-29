/**
 * Field primitives.
 *
 * A schema is a record of `Field`s. Each field carries codecs for both
 * wire formats (fanta + JSON), a `kind` tag the schema walker uses to
 * decide how to handle it (emit a literal, fill a default, recurse into
 * sub-fields...), and a phantom type parameter `T` that `In<S>` / `Out<S>`
 * extract via conditional inference.
 *
 * Five primitives cover every AO1 packet shape we've encountered:
 *
 *   str() / num() / bool()        required scalar
 *   opt(inner, default)           optional with default
 *   lit(value)                    wire-only literal (hidden from caller)
 *   blob({ subfields }, sep?)     sub-fields packed into one fanta slot
 *   custom({ ...codecs })         escape hatch for one-off shapes
 *
 * Add a new primitive when a spec quirk reappears across multiple
 * packets. One-off weirdness uses `custom()`.
 */

// ---------------------------------------------------------------------
// Internal: AO1 chat-escape helpers. Inlined so the library is
// dependency-free; if a sibling module starts needing them, factor out.
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

/** Discriminator for which kind of field this is — used by the walker. */
export type FieldKind = "scalar" | "optional" | "literal" | "blob" | "custom";

/**
 * A schema field. Codecs (`toFanta`/`fromFanta`/`toJson`/`fromJson`) do
 * the per-format work; `kind` tells the walker how to compose them.
 *
 * The phantom `__t` parameter is what lets `In<S>` and `Out<S>` recover
 * the value type via `infer T`. It is never set at runtime.
 */
export interface Field<T> {
  readonly kind: FieldKind;
  readonly __t?: T;

  /** Parse one fanta positional token into a typed value. */
  fromFanta(token: string, name: string): T;
  /** Serialize a typed value into one fanta positional token. */
  toFanta(value: T): string;
  /** Coerce a JSON-parsed value into a typed value (strict). */
  fromJson(value: unknown, name: string): T;
  /** Convert a typed value into a JSON-serializable value. */
  toJson(value: T): unknown;
}

export interface OptionalField<T> extends Field<T> {
  readonly kind: "optional";
  readonly default: T;
}

export interface LiteralField<T> extends Field<T> {
  readonly kind: "literal";
  readonly value: T;
}

export interface BlobField<T> extends Field<T> {
  readonly kind: "blob";
  readonly subfields: Record<string, Field<unknown>>;
  readonly separator: string;
}

/**
 * Derives the value type of a blob field from its sub-fields' value
 * types. Used by `blob()` to compute its `T`.
 */
export type BlobValue<S extends Record<string, Field<unknown>>> = {
  [K in keyof S]: S[K] extends Field<infer V> ? V : never;
};

// ---------------------------------------------------------------------
// Public constructors
// ---------------------------------------------------------------------

/** Required string field. Caller must provide a value. */
export function str(): Field<string> {
  return {
    kind: "scalar",
    fromFanta: (token) => unescapeUnicode(unescapeFanta(token)),
    toFanta: (value) => escapeFanta(value),
    fromJson: (value, name) => {
      if (typeof value !== "string") {
        throw new Error(
          `Invalid string for field '${name}': expected string, got ${typeof value}`,
        );
      }
      return value;
    },
    toJson: (value) => value,
  };
}

/** Required number field. Strict: empty / NaN tokens throw. */
export function num(): Field<number> {
  return {
    kind: "scalar",
    fromFanta: (token, name) => {
      // `Number("")` returns 0, masking an empty token as a valid value.
      // Reject empty + non-numeric tokens explicitly.
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
    fromJson: (value, name) => {
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error(
          `Invalid number for field '${name}': expected number, got ${typeof value}`,
        );
      }
      return value;
    },
    toJson: (value) => value,
  };
}

/** Required boolean field. Fanta wire is `"0"` or `"1"` exactly. */
export function bool(): Field<boolean> {
  return {
    kind: "scalar",
    fromFanta: (token, name) => {
      if (token !== "0" && token !== "1") {
        throw new Error(
          `Invalid boolean for field '${name}': expected "0" or "1", got ${JSON.stringify(token)}`,
        );
      }
      return token === "1";
    },
    toFanta: (value) => (value ? "1" : "0"),
    fromJson: (value, name) => {
      if (typeof value !== "boolean") {
        throw new Error(
          `Invalid boolean for field '${name}': expected boolean, got ${typeof value}`,
        );
      }
      return value;
    },
    toJson: (value) => value,
  };
}

/**
 * Mark a field as optional with a default. The walker fills the default
 * if the caller omits the field (and on decode, if the wire omits it).
 * Codecs are inherited from the inner field.
 */
export function opt<T>(inner: Field<T>, defaultValue: T): OptionalField<T> {
  return {
    kind: "optional",
    fromFanta: inner.fromFanta,
    toFanta: inner.toFanta,
    fromJson: inner.fromJson,
    toJson: inner.toJson,
    default: defaultValue,
  };
}

/**
 * Wire-only positional literal — `lit(0)` for CC's leading `0`,
 * `lit("CID")` for PV's padding token. The library emits `value` at this
 * field's position on encode and ignores whatever the wire delivers
 * there on decode. `In<S>` and `Out<S>` strip this field, so it never
 * appears on the caller-facing API.
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
    fromJson: inner.fromJson as Field<T>["fromJson"],
    toJson: inner.toJson as Field<T>["toJson"],
    value,
  };
}

/**
 * Sub-fields packed into a single fanta positional slot (joined by
 * `separator`, default `&`). On JSON, the value is a real nested
 * object keyed by the sub-field names. EI's `name&description&type&image`
 * blob is the canonical example.
 */
export function blob<S extends Record<string, Field<unknown>>>(
  subfields: S,
  separator: string = "&",
): BlobField<BlobValue<S>> {
  const keys = Object.keys(subfields);
  return {
    kind: "blob",
    subfields: subfields as Record<string, Field<unknown>>,
    separator,
    fromFanta(token, name) {
      const parts = token.split(separator);
      const result: Record<string, unknown> = {};
      keys.forEach((k, i) => {
        result[k] = subfields[k].fromFanta(parts[i] ?? "", `${name}.${k}`);
      });
      return result as BlobValue<S>;
    },
    toFanta(value) {
      return keys
        .map((k) =>
          subfields[k].toFanta((value as Record<string, unknown>)[k]),
        )
        .join(separator);
    },
    fromJson(value, name) {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error(
          `Invalid blob for field '${name}': expected object, got ${value === null ? "null" : Array.isArray(value) ? "array" : typeof value}`,
        );
      }
      const obj = value as Record<string, unknown>;
      const result: Record<string, unknown> = {};
      for (const k of keys) {
        result[k] = subfields[k].fromJson(obj[k], `${name}.${k}`);
      }
      return result as BlobValue<S>;
    },
    toJson(value) {
      const result: Record<string, unknown> = {};
      for (const k of keys) {
        result[k] = subfields[k].toJson(
          (value as Record<string, unknown>)[k],
        );
      }
      return result;
    },
  };
}

/**
 * Escape hatch for fields that don't fit any of the primitives. Define
 * the four codecs directly. Most schemas should never need this — prefer
 * adding a new primitive if a pattern reappears.
 */
export function custom<T>(codecs: {
  toFanta: (value: T) => string;
  fromFanta: (token: string, name: string) => T;
  toJson: (value: T) => unknown;
  fromJson: (value: unknown, name: string) => T;
}): Field<T> {
  return {
    kind: "custom",
    ...codecs,
  };
}
