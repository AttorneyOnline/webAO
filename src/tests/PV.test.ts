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

describe("PV CID literal slot follows the spec", () => {
  it("fanta encode emits the literal `CID` between player_id and char_id", () => {
    const wire = encode(PVPacket, { player_id: 3, char_id: 7 }, false);
    expect(wire).toBe("PV#3#CID#7#%");
  });

  it("decode strips the `_cid` slot from the typed result", () => {
    const decoded = decode(PVPacket, "PV#3#CID#7#%");
    expect(decoded).toEqual({ player_id: 3, char_id: 7 });
    expect("_cid" in decoded).toBe(false);
  });

  it("decode is forgiving about a different value at the CID position", () => {
    expect(decode(PVPacket, "PV#3#FOO#7#%")).toEqual({ player_id: 3, char_id: 7 });
  });

  it("JSON envelope omits the CID literal", () => {
    expect(encode(PVPacket, { player_id: 3, char_id: 7 }, true)).toBe(
      '{"$header":"PV","player_id":3,"char_id":7}',
    );
  });
});
