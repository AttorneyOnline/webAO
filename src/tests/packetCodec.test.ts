import { describe, it, expect } from "bun:test";
import { clientPacketRegistry, serverPacketRegistry } from "../packets";

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
  // Bidirectional headers appear in both registries; dedupe by the codec
  // identity so we don't run the same round-trip twice.
  const seen = new Set<unknown>();
  const entries = [
    ...[...clientPacketRegistry].map(([h, e]) => [h, e, "client"] as const),
    ...[...serverPacketRegistry].map(([h, e]) => [h, e, "server"] as const),
  ];

  for (const [header, entry, role] of entries) {
    // New-pattern entries (e.g. MC) have no `codec` — they're covered by
    // their own per-packet tests (see `MC.test.ts`).
    const codec = entry.codec;
    if (!codec) continue;
    if (seen.has(codec)) continue;
    seen.add(codec);
    if (!codec.encode) {
      it.skip(`${header} (${role}): codec is receive-only (no encode)`, () => {});
      continue;
    }

    it(`${header} (${role}): decode -> encode -> decode is a fixpoint`, () => {
      const args = makeArgs(header);
      const first = codec.decode(args);
      const wire = codec.encode!(first);
      const args2 = parseWire(wire);
      expect(args2[0]).toBe(header);
      const second = codec.decode(args2);
      expect(second).toEqual(first);
    });
  }
});
