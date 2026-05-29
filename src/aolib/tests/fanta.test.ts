import { describe, it, expect } from "bun:test";
import { toFantaArgs, fromFantaArgs } from "../fanta";
import { str, num, bool, opt, lit, nested, array, custom } from "../fields";
import type { Fields } from "../schema";

// ---------------------------------------------------------------------
// toFantaArgs — typed packet → ordered args list
// ---------------------------------------------------------------------

describe("toFantaArgs", () => {
  it("emits one slot per scalar field in declaration order", () => {
    const fields = {
      a: str(),
      b: num(),
      c: bool(),
    } satisfies Fields;
    expect(toFantaArgs(fields, { a: "x", b: 5, c: true })).toEqual([
      "x",
      "5",
      "1",
    ]);
  });

  it("emits the literal value at its slot, reading from the schema not the packet", () => {
    const fields = {
      _0: lit(0),
      char_id: num(),
      _pw: lit(""),
    } satisfies Fields;
    // packet doesn't carry literals — toFantaArgs reads them from
    // the field's `value`.
    expect(toFantaArgs(fields, { char_id: 5 })).toEqual(["0", "5", ""]);
  });

  it("emits an optional field's filled value (cast already applied defaults)", () => {
    const fields = {
      n: opt(num(), 99),
    } satisfies Fields;
    expect(toFantaArgs(fields, { n: 7 })).toEqual(["7"]);
    expect(toFantaArgs(fields, { n: 99 })).toEqual(["99"]);
  });

  it("packs nested sub-fields into one slot via the field's toFanta", () => {
    const fields = {
      offset: nested({ x: num(), y: num() }),
    } satisfies Fields;
    expect(toFantaArgs(fields, { offset: { x: 5, y: 3 } })).toEqual(["5&3"]);
  });

  it("expands an array into N slots — one per element", () => {
    const fields = {
      tags: array(str()),
    } satisfies Fields;
    expect(toFantaArgs(fields, { tags: ["a", "b", "c"] })).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("empty array produces zero slots", () => {
    const fields = {
      tags: array(str()),
    } satisfies Fields;
    expect(toFantaArgs(fields, { tags: [] })).toEqual([]);
  });

  it("array of nested objects expands and packs", () => {
    const fields = {
      peers: array(nested({ uid: num(), name: str() })),
    } satisfies Fields;
    const v = {
      peers: [
        { uid: 1, name: "Alice" },
        { uid: 2, name: "Bob" },
      ],
    };
    expect(toFantaArgs(fields, v)).toEqual(["1&Alice", "2&Bob"]);
  });

  it("preserved declaration order: literals, scalars, arrays at the end", () => {
    const fields = {
      _0: lit(0),
      header: str(),
      list: array(num()),
    } satisfies Fields;
    expect(
      toFantaArgs(fields, { header: "info", list: [1, 2, 3] }),
    ).toEqual(["0", "info", "1", "2", "3"]);
  });

  it("custom field uses its toFanta", () => {
    const hex = custom<number>({
      toFanta: (n) => `0x${n.toString(16)}`,
      fromFanta: (t) => parseInt(t.slice(2), 16),
    });
    const fields = { value: hex } satisfies Fields;
    expect(toFantaArgs(fields, { value: 255 })).toEqual(["0xff"]);
  });

  it("escapes chat meta-chars in string fields", () => {
    const fields = { msg: str() } satisfies Fields;
    expect(toFantaArgs(fields, { msg: "100% done & #1" })).toEqual([
      "100<percent> done <and> <num>1",
    ]);
  });

  it("empty schema → empty args", () => {
    const fields = {} satisfies Fields;
    expect(toFantaArgs(fields, {})).toEqual([]);
  });
});

// ---------------------------------------------------------------------
// fromFantaArgs — ordered args list → partial typed packet
// ---------------------------------------------------------------------

describe("fromFantaArgs", () => {
  it("decodes one slot per scalar in declaration order", () => {
    const fields = {
      a: str(),
      b: num(),
      c: bool(),
    } satisfies Fields;
    expect(fromFantaArgs(fields, ["x", "5", "1"])).toEqual({
      a: "x",
      b: 5,
      c: true,
    });
  });

  it("literal slots are consumed without storing", () => {
    const fields = {
      _0: lit(0),
      char_id: num(),
      _pw: lit(""),
    } satisfies Fields;
    const result = fromFantaArgs(fields, ["0", "5", ""]);
    expect(result).toEqual({ char_id: 5 });
    expect("_0" in result).toBe(false);
    expect("_pw" in result).toBe(false);
  });

  it("literal slots are forgiving — any value at that position is ignored", () => {
    const fields = {
      _0: lit(0),
      char_id: num(),
    } satisfies Fields;
    // A non-conforming server may put non-zero at the literal slot;
    // we still parse char_id correctly.
    expect(fromFantaArgs(fields, ["9", "5"])).toEqual({ char_id: 5 });
  });

  it("optional present on wire → decoded value", () => {
    const fields = { n: opt(num(), 99) } satisfies Fields;
    expect(fromFantaArgs(fields, ["7"])).toEqual({ n: 7 });
  });

  it("optional missing on wire → key omitted (cast fills default)", () => {
    const fields = {
      required: str(),
      maybe: opt(num(), 99),
    } satisfies Fields;
    const result = fromFantaArgs(fields, ["x"]);
    expect(result).toEqual({ required: "x" });
    expect("maybe" in result).toBe(false);
  });

  it("required missing on wire → key omitted (cast will throw)", () => {
    const fields = {
      a: str(),
      b: num(),
    } satisfies Fields;
    const result = fromFantaArgs(fields, ["x"]);
    expect(result).toEqual({ a: "x" });
    expect("b" in result).toBe(false);
  });

  it("nested unpacks one slot via its fromFanta", () => {
    const fields = {
      offset: nested({ x: num(), y: num() }),
    } satisfies Fields;
    expect(fromFantaArgs(fields, ["5&3"])).toEqual({
      offset: { x: 5, y: 3 },
    });
  });

  it("array consumes all remaining slots", () => {
    const fields = {
      header: str(),
      tags: array(str()),
    } satisfies Fields;
    expect(fromFantaArgs(fields, ["info", "a", "b", "c"])).toEqual({
      header: "info",
      tags: ["a", "b", "c"],
    });
  });

  it("array with zero remaining slots produces an empty array", () => {
    const fields = {
      header: str(),
      tags: array(str()),
    } satisfies Fields;
    expect(fromFantaArgs(fields, ["info"])).toEqual({
      header: "info",
      tags: [],
    });
  });

  it("array of nested objects parses each element", () => {
    const fields = {
      peers: array(nested({ uid: num(), name: str() })),
    } satisfies Fields;
    expect(fromFantaArgs(fields, ["1&Alice", "2&Bob"])).toEqual({
      peers: [
        { uid: 1, name: "Alice" },
        { uid: 2, name: "Bob" },
      ],
    });
  });

  it("array element errors include [i] index in the field path", () => {
    const fields = { list: array(num()) } satisfies Fields;
    expect(() => fromFantaArgs(fields, ["1", "2", "abc"])).toThrow(
      /'list\[2\]'/,
    );
  });

  it("custom field uses its fromFanta", () => {
    const hex = custom<number>({
      toFanta: (n) => `0x${n.toString(16)}`,
      fromFanta: (t) => parseInt(t.slice(2), 16),
    });
    const fields = { value: hex } satisfies Fields;
    expect(fromFantaArgs(fields, ["0xff"])).toEqual({ value: 255 });
  });

  it("strings are unescaped on the way in", () => {
    const fields = { msg: str() } satisfies Fields;
    expect(
      fromFantaArgs(fields, ["100<percent> done <and> <num>1"]),
    ).toEqual({ msg: "100% done & #1" });
  });

  it("empty schema with empty args yields empty result", () => {
    expect(fromFantaArgs({}, [])).toEqual({});
  });
});

// ---------------------------------------------------------------------
// Round-trip
// ---------------------------------------------------------------------

describe("toFantaArgs → fromFantaArgs round-trip", () => {
  it("scalars round-trip", () => {
    const fields = {
      a: str(),
      b: num(),
      c: bool(),
    } satisfies Fields;
    const v = { a: "hello", b: 42, c: true };
    expect(fromFantaArgs(fields, toFantaArgs(fields, v))).toEqual(v);
  });

  it("optional with non-default value round-trips", () => {
    const fields = { n: opt(num(), 99) } satisfies Fields;
    const v = { n: 7 };
    expect(fromFantaArgs(fields, toFantaArgs(fields, v))).toEqual(v);
  });

  it("literal slots stay correct through round-trip — result strips them", () => {
    const fields = {
      _0: lit(0),
      char_id: num(),
      _pw: lit(""),
    } satisfies Fields;
    const v = { char_id: 5 };
    expect(fromFantaArgs(fields, toFantaArgs(fields, v))).toEqual(v);
  });

  it("nested round-trips", () => {
    const fields = {
      offset: nested({ x: num(), y: num() }),
    } satisfies Fields;
    const v = { offset: { x: 5, y: 3 } };
    expect(fromFantaArgs(fields, toFantaArgs(fields, v))).toEqual(v);
  });

  it("array of nested objects round-trips", () => {
    const fields = {
      peers: array(nested({ uid: num(), name: str() })),
    } satisfies Fields;
    const v = {
      peers: [
        { uid: 1, name: "Alice" },
        { uid: 2, name: "Bob" },
      ],
    };
    expect(fromFantaArgs(fields, toFantaArgs(fields, v))).toEqual(v);
  });

  it("strings with chat meta-chars survive the round-trip", () => {
    const fields = { msg: str() } satisfies Fields;
    const v = { msg: "100% sure #1 alert & $5 bet" };
    expect(fromFantaArgs(fields, toFantaArgs(fields, v))).toEqual(v);
  });

  it("CC-style schema with literals + required round-trips", () => {
    const fields = {
      _0: lit(0),
      char_id: num(),
      _pw: lit(""),
    } satisfies Fields;
    const v = { char_id: 5 };
    const wire = toFantaArgs(fields, v);
    expect(wire).toEqual(["0", "5", ""]);
    expect(fromFantaArgs(fields, wire)).toEqual(v);
  });

  it("PV-style schema with literal between required scalars round-trips", () => {
    const fields = {
      player_id: num(),
      _cid: lit("CID"),
      char_id: num(),
    } satisfies Fields;
    const v = { player_id: 3, char_id: 7 };
    const wire = toFantaArgs(fields, v);
    expect(wire).toEqual(["3", "CID", "7"]);
    expect(fromFantaArgs(fields, wire)).toEqual(v);
  });
});
