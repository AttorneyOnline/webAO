import { describe, it, expect } from "bun:test";
import { decode, encode } from "../packets";
import { PVPacket } from "../packets/PV";

describe("PV encode/decode are inverses", () => {
  const packet = { player_id: 3, char_id: 7 };

  it("fanta encode -> decode preserves values", () => {
    const wire = encode(PVPacket, packet, false);
    expect(decode(PVPacket, wire)).toEqual(packet);
  });

  it("JSON encode -> decode preserves values", () => {
    const wire = encode(PVPacket, packet, true);
    expect(decode(PVPacket, wire)).toEqual(packet);
  });
});

describe("PV CID literal is handled inside toArgs/fromArgs", () => {
  it("fanta encode emits the literal `CID` between player_id and char_id", () => {
    expect(encode(PVPacket, { player_id: 3, char_id: 7 }, false)).toBe(
      "PV#3#CID#7#%",
    );
  });

  it("decode ignores the CID slot and returns just player_id + char_id", () => {
    expect(decode(PVPacket, "PV#3#CID#7#%")).toEqual({ player_id: 3, char_id: 7 });
  });

  it("decode is forgiving about a different value at the CID position", () => {
    expect(decode(PVPacket, "PV#3#FOO#7#%")).toEqual({ player_id: 3, char_id: 7 });
  });

  it("JSON envelope contains only player_id and char_id", () => {
    expect(encode(PVPacket, { player_id: 3, char_id: 7 }, true)).toBe(
      '{"$header":"PV","player_id":3,"char_id":7}',
    );
  });
});
