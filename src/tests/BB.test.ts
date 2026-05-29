import { describe, it, expect } from "bun:test";
import { decode, encode } from "../packets";
import { BBPacket } from "../packets/BB";

describe("BB encode/decode are inverses", () => {
  const packet = { message: "You are about to be kicked." };

  it("fanta encode -> decode preserves values", () => {
    const wire = encode(BBPacket, packet, false);
    expect(decode(BBPacket, wire)).toEqual(packet);
  });

  it("JSON encode -> decode preserves values", () => {
    const wire = encode(BBPacket, packet, true);
    expect(decode(BBPacket, wire)).toEqual(packet);
  });

  it("messages containing fanta meta-chars survive the fanta wire", () => {
    const tricky = { message: "100% sure #1 alert & $5 bet" };
    const wire = encode(BBPacket, tricky, false);
    expect(decode(BBPacket, wire)).toEqual(tricky);
  });

  it("encode throws when message is missing", () => {
    expect(() => encode(BBPacket, {}, false)).toThrow(
      /Missing required field 'message'/,
    );
  });

  it("decode throws when message is absent on the wire", () => {
    expect(() => decode(BBPacket, "BB#%")).toThrow(
      /Missing required field 'message'/,
    );
  });
});
