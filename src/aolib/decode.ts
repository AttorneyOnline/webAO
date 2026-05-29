/**
 * Decode: wire string → typed packet.
 *
 * Auto-detects format from the first byte (`{` ⇒ JSON envelope; anything
 * else ⇒ fanta positional), runs the format-specific walker, and finishes
 * with the shared `cast` gauntlet.
 *
 * Pipeline:
 *
 *   wire
 *     │
 *     ├── JSON path ──► JSON.parse → per-field fromJson → partial
 *     │
 *     └── fanta path ──► strip `#%` → split on `#` → drop header
 *                        → schema.fromArgs(args) OR fromFantaArgs(fields, args)
 *                        → partial
 *     │
 *     ▼  cast(fields, partial)
 *   filled packet (defaults applied, required validated, literals stripped)
 *
 * Defensive checks:
 *   - The `$header` field on a JSON envelope is matched against
 *     `schema.$header` and an error is thrown on mismatch. (Callers
 *     should already dispatch by header; this is belt-and-braces.)
 *   - Same check for the fanta header.
 */

import { cast } from "./cast";
import { fromJson } from "./json";
import { fromFantaArgs } from "./fanta";
import type { Fields, Schema } from "./schema";

export function decode<F extends Fields>(
  schema: Schema<F>,
  wire: string,
): Record<string, unknown> {
  return wire.startsWith("{") ? decodeJson(schema, wire) : decodeFanta(schema, wire);
}

function decodeJson<F extends Fields>(
  schema: Schema<F>,
  wire: string,
): Record<string, unknown> {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(wire) as Record<string, unknown>;
  } catch (err) {
    throw new Error(`Invalid JSON wire: ${(err as Error).message}`);
  }

  const wireHeader = parsed.$header;
  if (wireHeader !== schema.$header) {
    throw new Error(
      `Wire header mismatch: expected '${schema.$header}', got '${String(wireHeader)}'`,
    );
  }
  delete parsed.$header;

  // Per-field fromJson validates type for each present value and fills
  // optional defaults; literals are skipped (cast strips them anyway).
  const partial: Record<string, unknown> = {};
  for (const [name, field] of Object.entries(schema.fields)) {
    if (field.kind === "literal") continue;
    if (parsed[name] !== undefined) {
      partial[name] = fromJson(field, parsed[name], name);
    }
  }

  return cast(schema.fields, partial);
}

function decodeFanta<F extends Fields>(
  schema: Schema<F>,
  wire: string,
): Record<string, unknown> {
  // Peel terminator forms — accept canonical `HEADER#a#b#%`, plus the
  // legacy variants `HEADER#a#b#` and `HEADER#a#b`.
  let trimmed = wire;
  if (trimmed.endsWith("%")) trimmed = trimmed.slice(0, -1);
  if (trimmed.endsWith("#")) trimmed = trimmed.slice(0, -1);

  const all = trimmed.split("#");
  const wireHeader = all[0];
  if (wireHeader !== schema.$header) {
    throw new Error(
      `Wire header mismatch: expected '${schema.$header}', got '${String(wireHeader)}'`,
    );
  }
  const args = all.slice(1);

  // Schema-level override has precedence — used for packets whose
  // positional layout the default args walker can't express.
  const partial = schema.fromArgs
    ? schema.fromArgs(args)
    : fromFantaArgs(schema.fields, args);

  return cast(schema.fields, partial);
}
