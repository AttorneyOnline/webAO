import { describe, it, expect } from "bun:test";
import { decode, encode } from "../packets";
import { CCPacketServer } from "../packets/CC";

describe("CC encode/decode are inverses", () => {
  const packet = {
    player_id: 7,
    char_id: 5,
    char_pw: "web",
  };

  it("fanta encode -> decode preserves values", () => {
    const wire = encode(CCPacketServer, packet, false);
    expect(decode(CCPacketServer, wire)).toEqual(packet);
  });

  it("JSON encode -> decode preserves values", () => {
    const wire = encode(CCPacketServer, packet, true);
    expect(decode(CCPacketServer, wire)).toEqual(packet);
  });

  it("partial packet is filled with class defaults on encode -> decode", () => {
    const partial = { player_id: 7, char_id: 5 };
    const wire = encode(CCPacketServer, partial, false);
    const decoded = decode(CCPacketServer, wire);
    expect(decoded.player_id).toBe(7);
    expect(decoded.char_id).toBe(5);
    expect(decoded.char_pw).toBe("");
  });

  it("encode throws when a required field is missing", () => {
    expect(() => encode(CCPacketServer, {}, false)).toThrow(
      /Missing required field/,
    );
  });

  it("decode throws when a required field is missing on the wire", () => {
    expect(() => decode(CCPacketServer, "CC#%")).toThrow(/Missing required field/);
  });
});
