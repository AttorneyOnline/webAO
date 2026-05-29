/**
 * JSON Schema export for documentation.
 *
 * Walks a schema and emits standards-compliant JSON Schema (draft-07).
 * The output is consumable by:
 *   - JSON Schema viewers / Stoplight / Redoc
 *   - AsyncAPI (purpose-built for WebSocket message protocols — fits AO)
 *   - Ajv (if you ever want compiled runtime validation)
 *   - Other-language clients of the same protocol
 *
 * Mirrors the wire-format split:
 *   - Literal fields (positional padding in fanta, e.g. CC's leading
 *     `0`) are NOT in the JSON envelope, so they're omitted from the
 *     emitted schema.
 *   - Nested fields are real nested objects in JSON (the fanta
 *     `&`-packing is invisible here).
 *   - Array fields are real arrays in JSON (the fanta greedy
 *     consumption is invisible here).
 *
 * The `$header` is included as a `const`-typed property so a JSON
 * Schema validator can confirm the envelope's header matches.
 */

import type {
  Field,
  OptionalField,
  NestedField,
  ArrayField,
  CustomField,
} from "./fields";
import type { Fields, Schema } from "./schema";

/** JSON Schema for one packet schema. */
export function toJsonSchema<F extends Fields>(
  schema: Schema<F>,
): Record<string, unknown> {
  const inner = fieldsToProperties(schema.fields);
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: schema.$header,
    type: "object",
    properties: {
      $header: { type: "string", const: schema.$header },
      ...inner.properties,
    },
    required: ["$header", ...inner.required],
    additionalProperties: false,
  };
}

/** Build a JSON Schema fragment for one field. Returns undefined for literals (omitted from envelope). */
function fieldToJsonSchema(
  field: Field<unknown>,
): Record<string, unknown> | undefined {
  switch (field.kind) {
    case "string":
      return { type: "string" };
    case "number":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "optional": {
      const f = field as OptionalField<unknown>;
      const inner = fieldToJsonSchema(f.inner);
      return inner ? { ...inner, default: f.default } : undefined;
    }
    case "literal":
      // Wire-only positional padding. Not in JSON envelope.
      return undefined;
    case "nested": {
      const f = field as NestedField<Record<string, Field<unknown>>>;
      const { properties, required } = fieldsToProperties(f.subfields);
      return {
        type: "object",
        properties,
        required,
        additionalProperties: false,
      };
    }
    case "array": {
      const f = field as ArrayField<Field<unknown>>;
      const items = fieldToJsonSchema(f.element);
      return { type: "array", items: items ?? {} };
    }
    case "custom": {
      const f = field as CustomField<unknown> & {
        jsonSchema?: Record<string, unknown>;
      };
      // Custom fields can opt in to a JSON Schema fragment via a
      // `jsonSchema` property on the field, alongside their opt-in
      // `toJson` / `fromJson` hooks. Default is the permissive
      // `{}` (any value passes).
      return f.jsonSchema ?? {};
    }
  }
}

/** Build `{ properties, required }` for a fields record, skipping literals. */
function fieldsToProperties(fields: Record<string, Field<unknown>>): {
  properties: Record<string, unknown>;
  required: string[];
} {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const [name, field] of Object.entries(fields)) {
    const sub = fieldToJsonSchema(field);
    if (sub === undefined) continue; // literal stripped
    properties[name] = sub;
    if (field.kind !== "optional") required.push(name);
  }
  return { properties, required };
}
