/**
 * The required-field gauntlet.
 *
 * Runs over the partial result of a decoder walker (or the partial input
 * to an encoder) and produces a "filled" packet:
 *
 *   - Required fields with no value → throw `Missing required field 'X'`.
 *   - Optional fields with no value → fill from `inner.default`.
 *   - Literal fields → strip from the result (they're wire-only padding,
 *     not part of the typed API).
 *   - Nested fields → recurse into sub-fields with the same rules.
 *   - Array fields → recurse into each element if the element is a
 *     composite (nested / array); scalars pass through.
 *   - Custom fields → pass through (the field's own codec decides shape).
 *
 * `cast` is symmetric across wire formats — both `encode(...)` and
 * `decode(...)` run it. For decode, it fills in fields the wire didn't
 * carry; for encode, it ensures the typed input is complete before
 * serialization.
 *
 * Extra keys in `partial` that aren't in the schema's fields are
 * silently dropped — the schema is the source of truth for shape.
 */

import type {
  Field,
  OptionalField,
  NestedField,
  ArrayField,
} from "./fields";
import type { Fields } from "./schema";

export function cast<F extends Fields>(
  fields: F,
  partial: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(fields)) {
    if (field.kind === "literal") {
      // Wire-only padding. Strip from the typed result.
      continue;
    }

    if (field.kind === "optional") {
      const f = field as OptionalField<unknown>;
      const value = partial[name];
      out[name] =
        value === undefined ? f.default : castValue(f.inner, value, name);
      continue;
    }

    // Required field (scalar / nested / array / custom).
    const value = partial[name];
    if (value === undefined) {
      throw new Error(`Missing required field '${name}'`);
    }
    out[name] = castValue(field, value, name);
  }
  return out;
}

function castValue(
  field: Field<unknown>,
  value: unknown,
  name: string,
): unknown {
  switch (field.kind) {
    case "nested": {
      const f = field as NestedField<Record<string, Field<unknown>>>;
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error(
          `Field '${name}': expected object, got ${typeOfDesc(value)}`,
        );
      }
      return cast(f.subfields, value as Record<string, unknown>);
    }

    case "array": {
      const f = field as ArrayField<Field<unknown>>;
      if (!Array.isArray(value)) {
        throw new Error(
          `Field '${name}': expected array, got ${typeOfDesc(value)}`,
        );
      }
      return value.map((item, i) =>
        castValue(f.element, item, `${name}[${i}]`),
      );
    }

    default:
      // string / number / boolean / custom — value passes through as-is.
      // (Type validation happens at the wire-format walker layer.)
      return value;
  }
}

function typeOfDesc(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}
