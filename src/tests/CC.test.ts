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
    expect(() => encode(CCPacketServer, {}, false)).toThrow(
      /Missing required field 'char_id'/,
    );
  });

  it("decode throws when char_id is missing on the wire", () => {
    expect(() => decode(CCPacketServer, "CC#%")).toThrow(/Missing required field/);
  });
});

describe("CC literal slots follow the spec", () => {
  it("fanta encode emits both spec literals (`0` and empty char_pw)", () => {
    const wire = encode(CCPacketServer, { char_id: 5 }, false);
    expect(wire).toBe("CC#0#5##%");
  });

  it("decode strips both literal slots from the typed result", () => {
    const decoded = decode(CCPacketServer, "CC#0#5##%");
    expect(decoded).toEqual({ char_id: 5 });
    expect("_zero" in decoded).toBe(false);
    expect("_char_pw_deprecated" in decoded).toBe(false);
  });

  it("decode is forgiving about unexpected values at literal positions", () => {
    // A legacy/non-conforming server may put non-zero or a real pw
    // there; we still parse char_id and don't reject the packet.
    expect(decode(CCPacketServer, "CC#7#5#web#%")).toEqual({ char_id: 5 });
  });

  it("JSON envelope omits both literals", () => {
    expect(encode(CCPacketServer, { char_id: 5 }, true)).toBe(
      '{"$header":"CC","char_id":5}',
    );
  });
});
