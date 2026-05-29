import { describe, it, expect } from "bun:test";
import { decode, encode } from "../packets";
import { ASSPacket } from "../packets/ASS";
import { BDPacket } from "../packets/BD";
import { CHECKPacket } from "../packets/CHECK";
import { JDPacket } from "../packets/JD";
import { KBPacket } from "../packets/KB";
import { KKPacket } from "../packets/KK";

// Batch round-trip tests for the simple-shape receive-only packets
// migrated in the same pass. Each follows the same template: single
// required field, server -> client direction.

describe("ASS round-trip", () => {
  const sample = { asset_url: "https://example.com/" };
  it("fanta", () => expect(decode(ASSPacket, encode(ASSPacket, sample, false))).toEqual(sample));
  it("JSON", () => expect(decode(ASSPacket, encode(ASSPacket, sample, true))).toEqual(sample));
  it("encode throws when asset_url missing", () =>
    expect(() => encode(ASSPacket, {}, false)).toThrow(/Missing required field 'asset_url'/));
});

describe("BD round-trip", () => {
  const sample = { reason: "you tried to reconnect after a ban" };
  it("fanta", () => expect(decode(BDPacket, encode(BDPacket, sample, false))).toEqual(sample));
  it("JSON", () => expect(decode(BDPacket, encode(BDPacket, sample, true))).toEqual(sample));
  it("encode throws when reason missing", () =>
    expect(() => encode(BDPacket, {}, false)).toThrow(/Missing required field 'reason'/));
});

describe("KB round-trip", () => {
  const sample = { reason: "harassment" };
  it("fanta", () => expect(decode(KBPacket, encode(KBPacket, sample, false))).toEqual(sample));
  it("JSON", () => expect(decode(KBPacket, encode(KBPacket, sample, true))).toEqual(sample));
});

describe("KK round-trip", () => {
  const sample = { reason: "see you tomorrow" };
  it("fanta", () => expect(decode(KKPacket, encode(KKPacket, sample, false))).toEqual(sample));
  it("JSON", () => expect(decode(KKPacket, encode(KKPacket, sample, true))).toEqual(sample));
});

describe("JD round-trip", () => {
  it("fanta state=1", () => expect(decode(JDPacket, encode(JDPacket, { state: 1 }, false))).toEqual({ state: 1 }));
  it("JSON state=0", () => expect(decode(JDPacket, encode(JDPacket, { state: 0 }, true))).toEqual({ state: 0 }));
  it("encode throws when state missing", () =>
    expect(() => encode(JDPacket, {}, false)).toThrow(/Missing required field 'state'/));
});

describe("CHECK (empty payload) round-trip", () => {
  it("fanta wire is canonical `CHECK#%`", () =>
    expect(encode(CHECKPacket, {}, false)).toBe("CHECK#%"));
  it("fanta", () =>
    expect(decode(CHECKPacket, encode(CHECKPacket, {}, false))).toEqual({}));
  it("JSON", () =>
    expect(decode(CHECKPacket, encode(CHECKPacket, {}, true))).toEqual({}));
});
