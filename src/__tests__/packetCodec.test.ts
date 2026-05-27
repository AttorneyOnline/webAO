import { describe, it, expect } from "bun:test";
import { packetRegistry } from "../packets";

/**
 * Reverse the dispatcher's wire-level parsing: given a string like
 * `XX#a#b#%`, return `["XX", "a", "b"]`.
 */
function parseWire(wire: string): string[] {
  const segments = wire.split("%");
  if (segments.length !== 2 || segments[1] !== "") {
    throw new Error(
      `encode produced non-canonical wire ${JSON.stringify(wire)}`,
    );
  }
  const segment = segments[0];
  const body = segment.endsWith("#") ? segment.slice(0, -1) : segment;
  return body.split("#");
}

/**
 * Generic synthetic input. Long enough to cover MS (~30 fields including
 * the optional 2.8 group); mixes string-shaped and number-shaped tokens so
 * codecs that call `Number(args[N])` get something parseable.
 */
function makeArgs(header: string): string[] {
  const fillers: string[] = [];
  for (let i = 1; i <= 32; i++) fillers.push(i % 2 ? `v${i}` : String(i));
  return [header, ...fillers];
}

describe("packet codec round-trip idempotence", () => {
  for (const [header, entry] of packetRegistry) {
    if (!entry.codec.encode) {
      it.skip(`${header}: codec is receive-only (no encode)`, () => {});
      continue;
    }

    it(`${header}: decode -> encode -> decode is a fixpoint`, () => {
      const args = makeArgs(header);
      const first = entry.codec.decode(args);
      const wire = entry.codec.encode!(first);
      const args2 = parseWire(wire);
      expect(args2[0]).toBe(header);
      const second = entry.codec.decode(args2);
      expect(second).toEqual(first);
    });
  }
});
