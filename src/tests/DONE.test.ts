import { describe, it, expect } from "bun:test";
import { decode, encode } from "../packets";
import { DONEPacket } from "../packets/DONE";

describe("DONE encode/decode are inverses", () => {
  it("fanta encode emits the canonical zero-field wire", () => {
    expect(encode(DONEPacket, {}, false)).toBe("DONE#%");
  });

  it("fanta encode -> decode preserves the empty payload", () => {
    const wire = encode(DONEPacket, {}, false);
    expect(decode(DONEPacket, wire)).toEqual({});
  });

  it("JSON encode -> decode preserves the empty payload", () => {
    const wire = encode(DONEPacket, {}, true);
    expect(decode(DONEPacket, wire)).toEqual({});
  });
});
