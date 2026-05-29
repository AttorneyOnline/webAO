/**
 * Encode: typed packet → wire string.
 *
 * Single public entry point with a `mode` selector. Both wire formats
 * share the same gauntlet (`cast`) and dispatch into their walkers
 * (`toJson` / `toFantaArgs`). The fanta path additionally consults the
 * schema's optional `toArgs` override before falling back to the
 * default args walker.
 *
 * Pipeline:
 *
 *   packet
 *     │
 *     ▼  cast(fields, packet)
 *   filled packet (defaults applied, required validated, literals stripped)
 *     │
 *     ├── JSON mode ──► { $header, ...toJson(field, value) per non-literal } → JSON.stringify
 *     │
 *     └── fanta mode ──► schema.toArgs(filled) OR toFantaArgs(fields, filled)
 *                        → frame as `HEADER#…#%`
 */

import { cast } from "./cast";
import { toJson } from "./json";
import { toFantaArgs } from "./fanta";
import type { Fields, Schema } from "./schema";

export type WireMode = "fanta" | "json";

export function encode<F extends Fields>(
  schema: Schema<F>,
  packet: Record<string, unknown>,
  mode: WireMode,
): string {
  // Defaults filled, required validated, literals stripped. Both
  // wire-format paths consume the result.
  const filled = cast(schema.fields, packet);

  if (mode === "json") {
    return encodeJson(schema, filled);
  }
  return encodeFanta(schema, filled);
}

function encodeJson<F extends Fields>(
  schema: Schema<F>,
  filled: Record<string, unknown>,
): string {
  const envelope: Record<string, unknown> = { $header: schema.$header };
  for (const [name, field] of Object.entries(schema.fields)) {
    if (field.kind === "literal") continue;
    envelope[name] = toJson(field, filled[name] as never);
  }
  return JSON.stringify(envelope);
}

function encodeFanta<F extends Fields>(
  schema: Schema<F>,
  filled: Record<string, unknown>,
): string {
  // Schema-level override takes precedence — used for packets whose
  // wire layout the default args walker can't express.
  const args = schema.toArgs
    ? schema.toArgs(filled)
    : toFantaArgs(schema.fields, filled);
  return frameFantaWire(schema.$header, args);
}

/**
 * `HEADER#a#b#%` for non-empty args, `HEADER#%` for zero args.
 * Spec-canonical — the trailing `%` is the wire terminator.
 */
function frameFantaWire(header: string, args: string[]): string {
  if (args.length === 0) return `${header}#%`;
  return `${header}#${args.join("#")}#%`;
}
