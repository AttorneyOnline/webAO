import { describe, it, expect } from "bun:test";
import { cast } from "../cast";
import { str, num, opt, lit, nested, array } from "../fields";
import type { Fields } from "../schema";

describe("cast: required vs missing", () => {
  it("required field present passes through", () => {
    const fields = { name: str() } satisfies Fields;
    expect(cast(fields, { name: "x" })).toEqual({ name: "x" });
  });

  it("required field missing throws with field name", () => {
    const fields = { name: str(), char_id: num() } satisfies Fields;
    expect(() => cast(fields, { name: "x" })).toThrow(
      /Missing required field 'char_id'/,
    );
  });

  it("first missing required field is reported", () => {
    const fields = { a: str(), b: num() } satisfies Fields;
    expect(() => cast(fields, {})).toThrow(/Missing required field 'a'/);
  });
});

describe("cast: optional + default fill", () => {
  it("optional field missing → default", () => {
    const fields = { n: opt(num(), 99) } satisfies Fields;
    expect(cast(fields, {})).toEqual({ n: 99 });
  });

  it("optional field present → provided value", () => {
    const fields = { n: opt(num(), 99) } satisfies Fields;
    expect(cast(fields, { n: 5 })).toEqual({ n: 5 });
  });

  it("multiple optionals fill independently", () => {
    const fields = {
      a: opt(str(), "default-a"),
      b: opt(num(), 0),
    } satisfies Fields;
    expect(cast(fields, { b: 7 })).toEqual({ a: "default-a", b: 7 });
  });
});

describe("cast: literal stripping", () => {
  it("literal fields are absent from the result", () => {
    const fields = {
      _0: lit(0),
      char_id: num(),
      _pw: lit(""),
    } satisfies Fields;
    const out = cast(fields, { char_id: 5 });
    expect(out).toEqual({ char_id: 5 });
    expect("_0" in out).toBe(false);
    expect("_pw" in out).toBe(false);
  });

  it("literal in partial input is ignored", () => {
    // Even if the caller smuggled in a literal key (e.g. via decode
    // bypassing the walker), cast strips it.
    const fields = { _0: lit(0), char_id: num() } satisfies Fields;
    const out = cast(fields, { _0: 9, char_id: 5 } as Record<string, unknown>);
    expect(out).toEqual({ char_id: 5 });
  });
});

describe("cast: extra keys", () => {
  it("keys not in the schema are silently dropped", () => {
    const fields = { name: str() } satisfies Fields;
    const out = cast(fields, { name: "x", extra: "junk", other: 42 });
    expect(out).toEqual({ name: "x" });
  });
});

describe("cast: nested", () => {
  const fields = {
    offset: nested({ x: num(), y: opt(num(), 0) }),
  } satisfies Fields;

  it("nested with all fields present passes through", () => {
    expect(cast(fields, { offset: { x: 5, y: 3 } })).toEqual({
      offset: { x: 5, y: 3 },
    });
  });

  it("nested fills sub-field defaults", () => {
    expect(cast(fields, { offset: { x: 5 } })).toEqual({
      offset: { x: 5, y: 0 },
    });
  });

  it("nested with missing required sub-field throws (dotted-ish path)", () => {
    expect(() => cast(fields, { offset: { y: 3 } })).toThrow(
      /Missing required field 'x'/,
    );
  });

  it("nested value with wrong type throws", () => {
    expect(() => cast(fields, { offset: "not-an-object" })).toThrow(
      /Field 'offset': expected object/,
    );
  });
});

describe("cast: array", () => {
  it("array of scalars passes through", () => {
    const fields = { tags: array(str()) } satisfies Fields;
    expect(cast(fields, { tags: ["a", "b", "c"] })).toEqual({
      tags: ["a", "b", "c"],
    });
  });

  it("array of nested validates each element recursively", () => {
    const fields = {
      peers: array(nested({ uid: num(), name: str() })),
    } satisfies Fields;
    const v = {
      peers: [
        { uid: 1, name: "Alice" },
        { uid: 2, name: "Bob" },
      ],
    };
    expect(cast(fields, v)).toEqual(v);
  });

  it("array element with missing required sub-field throws", () => {
    const fields = {
      peers: array(nested({ uid: num(), name: str() })),
    } satisfies Fields;
    expect(() =>
      cast(fields, { peers: [{ uid: 1, name: "A" }, { uid: 2 }] }),
    ).toThrow(/Missing required field 'name'/);
  });

  it("non-array value throws", () => {
    const fields = { list: array(str()) } satisfies Fields;
    expect(() => cast(fields, { list: "not-an-array" })).toThrow(
      /Field 'list': expected array/,
    );
  });

  it("empty array passes through", () => {
    const fields = { list: array(str()) } satisfies Fields;
    expect(cast(fields, { list: [] })).toEqual({ list: [] });
  });
});

describe("cast: empty schema", () => {
  it("empty schema produces empty result regardless of input keys", () => {
    expect(cast({}, { foo: 1, bar: 2 })).toEqual({});
  });
});
