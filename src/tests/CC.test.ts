import { describe, it, expect } from "bun:test";
import { decode, encode } from "../packets";
import { CCPacketServer } from "../packets/CC";

describe("CC encode/decode are inverses", () => {
  const packet = { char_id: 5 };

  it("fanta encode -> decode preserves values", () => {
    const wire = encode(CCPacketServer, packet, false);
    expect(decode(CCPacketServer, wire)).toEqual(packet);
  });

  it("JSON encode -> decode preserves values", () => {
    const wire = encode(CCPacketServer, packet, true);
    expect(decode(CCPacketServer, wire)).toEqual(packet);
  });

  it("encode throws when char_id is missing", () => {
    expect(() => encode(CCPacketServer, {} as CCPacketServer, false)).toThrow(
      /Missing required field 'char_id'/,
    );
  });

  it("decode throws when char_id is missing on the wire", () => {
    expect(() => decode(CCPacketServer, "CC#%")).toThrow(/Missing required field/);
  });
});

describe("CC wire-spec literals are handled inside toArgs/fromArgs", () => {
  it("fanta encode emits the spec wire `CC#0#{char_id}##%`", () => {
    expect(encode(CCPacketServer, { char_id: 5 }, false)).toBe("CC#0#5##%");
  });

  it("decode ignores both literal slots and returns just char_id", () => {
    expect(decode(CCPacketServer, "CC#0#5##%")).toEqual({ char_id: 5 });
  });

  it("decode is forgiving about unexpected values at literal positions", () => {
    // A legacy/non-conforming server may put non-zero or a real pw
    // there; we still parse char_id and don't reject the packet.
    expect(decode(CCPacketServer, "CC#7#5#web#%")).toEqual({ char_id: 5 });
  });

  it("JSON envelope contains only char_id", () => {
    expect(encode(CCPacketServer, { char_id: 5 }, true)).toBe(
      '{"$header":"CC","char_id":5}',
    );
  });
});
