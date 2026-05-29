import { describe, it, expect } from "bun:test";
import { decode, encode } from "../packets";
import { AUTHPacket } from "../packets/AUTH";

describe("AUTH encode/decode are inverses", () => {
  const packet = { auth_state: 1 };

  it("fanta encode -> decode preserves values", () => {
    const wire = encode(AUTHPacket, packet, false);
    expect(decode(AUTHPacket, wire)).toEqual(packet);
  });

  it("JSON encode -> decode preserves values", () => {
    const wire = encode(AUTHPacket, packet, true);
    expect(decode(AUTHPacket, wire)).toEqual(packet);
  });

  it("encode throws when the required auth_state is missing", () => {
    expect(() => encode(AUTHPacket, {} as AUTHPacket, false)).toThrow(
      /Missing required field 'auth_state'/,
    );
  });

  it("decode throws when the required auth_state is missing on the wire", () => {
    expect(() => decode(AUTHPacket, "AUTH#%")).toThrow(
      /Missing required field 'auth_state'/,
    );
  });
});
