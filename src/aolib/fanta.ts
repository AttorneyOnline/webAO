/**
 * Fanta wire-format walker.
 *
 * Mirror of `./json` for the positional wire format. The library handles
 * framing (`HEADER#…#%`) and terminator peeling elsewhere; this module
 * owns the args-list step: typed packet → ordered list of string tokens,
 * and back.
 *
 * Each field kind has specific positional semantics:
 *
 *   string / number / boolean   one slot each, codecs from the field
 *   optional                    one slot; missing on wire ⇒ cast fills default
 *   literal                     one slot, emit the fixed value; on decode
 *                               consume the slot but don't store (cast strips)
 *   nested                      one slot, packed with separator (the
 *                               nested field's own toFanta/fromFanta)
 *   array                       GREEDY: consumes all remaining slots on
 *                               decode, expands to multiple slots on encode.
 *                               Must be the last field in the schema; only
 *                               one array per schema. Multi-array packets
 *                               use schema-level toArgs/fromArgs overrides.
 *   custom                      one slot, codecs from the field
 *
 * The walker dispatches on `kind`. Fields' own `fromFanta` / `toFanta`
 * methods do the per-token work for everything except array (which
 * delegates to its `element`) and literal (which uses its `value`).
 *
 * Callers (encode.ts / decode.ts):
 *   - `toFantaArgs` runs AFTER `cast` has filled defaults and validated
 *     required, so every non-literal slot has a value.
 *   - `fromFantaArgs` runs BEFORE `cast` so the partial it returns lets
 *     cast fill defaults / throw on missing required, same as the JSON
 *     path.
 */

import type {
  Field,
  LiteralField,
  ArrayField,
  OptionalField,
} from "./fields";
import type { Fields } from "./schema";

/**
 * Walk a schema's fields and emit the ordered positional args list
 * for the fanta wire. The library frames `HEADER#…#%` around it.
 *
 * `packet` is the cast-filled typed packet (defaults already applied,
 * required fields validated). Every non-literal slot reads from it.
 */
export function toFantaArgs<F extends Fields>(
  fields: F,
  packet: Record<string, unknown>,
): string[] {
  const args: string[] = [];
  for (const [name, field] of Object.entries(fields)) {
    switch (field.kind) {
      case "literal": {
        // Emit the fixed value; packet doesn't carry literals.
        const f = field as LiteralField<unknown>;
        args.push(field.toFanta(f.value as never));
        break;
      }
      case "array": {
        // Greedy: one arg per element.
        const f = field as ArrayField<Field<unknown>>;
        const items = packet[name] as unknown[];
        for (const item of items) {
          args.push(f.element.toFanta(item as never));
        }
        break;
      }
      default: {
        // string / number / boolean / optional / nested / custom — one
        // slot per field, codec already on the field.
        args.push(field.toFanta(packet[name] as never));
        break;
      }
    }
  }
  return args;
}

/**
 * Walk a schema's fields and parse the ordered positional args list
 * from the fanta wire into a partial typed packet. `cast` runs over
 * the result to fill defaults and validate required fields.
 *
 * Literal slots are consumed without storing; arrays consume all
 * remaining slots; optionals omit their key when the wire ended early
 * (cast fills the default from `inner.default`).
 */
export function fromFantaArgs<F extends Fields>(
  fields: F,
  args: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let cursor = 0;

  for (const [name, field] of Object.entries(fields)) {
    switch (field.kind) {
      case "literal": {
        // Consume the slot, don't store. Whatever the wire delivered
        // there is ignored — cast strips the field from the result
        // either way.
        cursor++;
        break;
      }

      case "array": {
        // Greedy: take all remaining args as the array's elements.
        const f = field as ArrayField<Field<unknown>>;
        const remaining = args.slice(cursor);
        result[name] = remaining.map((token, i) =>
          f.element.fromFanta(token, `${name}[${i}]`),
        );
        cursor = args.length;
        break;
      }

      case "optional": {
        // If the wire ran out, omit the key — cast will fill the
        // default. If present, parse via the inner codec (the optional
        // field's fromFanta is inherited from inner).
        const token = args[cursor++];
        if (token !== undefined) {
          result[name] = field.fromFanta(token, name);
        }
        break;
      }

      default: {
        // string / number / boolean / nested / custom — one slot, the
        // field's codec handles it. A missing token leaves the key out
        // of the result; cast will throw for required fields.
        const token = args[cursor++];
        if (token !== undefined) {
          result[name] = field.fromFanta(token, name);
        }
        break;
      }
    }
  }

  return result;
}
