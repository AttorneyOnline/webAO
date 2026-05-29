/**
 * JSON wire-format walker.
 *
 * Per-field JSON codecs were noise — every primitive's `toJson` was
 * identity and every `fromJson` was a `typeof` check. Now the library
 * walks a field's `kind` discriminator and validates / serializes
 * generically. Each primitive only carries its fanta codecs (where the
 * real format-specific work happens) and a kind tag.
 *
 * Adding a new field kind here means adding one `case` to each of
 * `fromJson` and `toJson` — no per-field method to update across
 * existing primitives.
 *
 * "Blob"-style fanta packing (separator-joined sub-fields) is invisible
 * here. A `nested` field's JSON value is a real nested object; this
 * walker validates the shape via the sub-fields and never touches the
 * separator. That metadata is read by the fanta walker only.
 */

import type {
  Field,
  OptionalField,
  LiteralField,
  NestedField,
  ArrayField,
  CustomField,
} from "./fields";

/**
 * Validate + parse a JSON-decoded value against a field's expected
 * shape. Throws with a field-name-prefixed error on type mismatch.
 *
 * Used by `decode` on the JSON path: `JSON.parse(body)` produces a
 * candidate object; this walker validates each top-level field against
 * the schema, recursing into nested objects and array elements.
 */
export function fromJson<T>(field: Field<T>, value: unknown, name: string): T {
  switch (field.kind) {
    case "string":
      if (typeof value !== "string") {
        throw new Error(
          `Field '${name}': expected string, got ${typeOfDesc(value)}`,
        );
      }
      return value as T;

    case "number":
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new Error(
          `Field '${name}': expected number, got ${typeOfDesc(value)}`,
        );
      }
      return value as T;

    case "boolean":
      if (typeof value !== "boolean") {
        throw new Error(
          `Field '${name}': expected boolean, got ${typeOfDesc(value)}`,
        );
      }
      return value as T;

    case "optional": {
      const f = field as unknown as OptionalField<T>;
      if (value === undefined) return f.default;
      return fromJson(f.inner, value, name);
    }

    case "literal":
      // Literals don't appear in JSON envelopes (they're wire-only
      // positional padding for fanta). Return the fixed value;
      // anything the wire delivered at this key is ignored.
      return (field as unknown as LiteralField<T>).value;

    case "nested": {
      const f = field as unknown as NestedField<Record<string, Field<unknown>>>;
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error(
          `Field '${name}': expected object, got ${typeOfDesc(value)}`,
        );
      }
      const obj = value as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const [k, sub] of Object.entries(f.subfields)) {
        out[k] = fromJson(sub, obj[k], `${name}.${k}`);
      }
      return out as T;
    }

    case "array": {
      const f = field as unknown as ArrayField<Field<unknown>>;
      if (!Array.isArray(value)) {
        throw new Error(
          `Field '${name}': expected array, got ${typeOfDesc(value)}`,
        );
      }
      return value.map((item, i) =>
        fromJson(f.element, item, `${name}[${i}]`),
      ) as T;
    }

    case "custom": {
      const f = field as unknown as CustomField<T>;
      // Default is identity — JSON-native types pass through. Opt-in
      // hook for genuinely weird custom fields.
      return f.fromJson ? f.fromJson(value, name) : (value as T);
    }
  }
}

/**
 * Convert a typed value into a JSON-serializable shape. For most
 * primitives this is identity — the typed value IS the JSON value.
 * Only `nested`, `array`, and (optionally) `custom` recurse.
 *
 * Used by `encode` on the JSON path: walk the schema's fields, build
 * a plain object, then `JSON.stringify` the result.
 *
 * Literal fields are intentionally skipped — the caller of `toJson`
 * (the schema walker in `encode`) should not include literal fields
 * in the JSON envelope at all.
 */
export function toJson<T>(field: Field<T>, value: T): unknown {
  switch (field.kind) {
    case "string":
    case "number":
    case "boolean":
    case "optional":
    case "literal":
      // Identity. Literals shouldn't be passed in (skipped at the
      // schema walker level); if they are, the value's already typed
      // correctly.
      return value;

    case "nested": {
      const f = field as unknown as NestedField<Record<string, Field<unknown>>>;
      const out: Record<string, unknown> = {};
      for (const [k, sub] of Object.entries(f.subfields)) {
        out[k] = toJson(
          sub,
          (value as Record<string, unknown>)[k] as never,
        );
      }
      return out;
    }

    case "array": {
      const f = field as unknown as ArrayField<Field<unknown>>;
      return (value as unknown[]).map((item) =>
        toJson(f.element, item as never),
      );
    }

    case "custom": {
      const f = field as unknown as CustomField<T>;
      return f.toJson ? f.toJson(value) : value;
    }
  }
}

function typeOfDesc(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}
