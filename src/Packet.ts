/**
 * Base class for all packet schemas. The `[key: string]: unknown` index
 * signature is what lets `cast`/`encode`/`decode` do dynamic property
 * access (`instance[name]`) without `Record<string, unknown>` escapes.
 * Subclasses set `static $header` to the wire header string and declare
 * fields via class initializers (`= req(...)` or `= defaultValue`).
 *
 * Kept in its own file to break the circular import between `packets.ts`
 * (which imports every per-packet file) and the per-packet files (which
 * need `Packet` for `extends`).
 */
export class Packet {
  static $header: string;
  [key: string]: unknown;
}
