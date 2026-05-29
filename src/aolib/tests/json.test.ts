import { describe, it, expect } from "bun:test";
import { fromJson, toJson } from "../json";
import { str, num, bool, opt, lit, nested, array, custom } from "../fields";

// ---------------------------------------------------------------------
// fromJson — strict per-leaf validation
// ---------------------------------------------------------------------

describe("fromJson: string", () => {
  it("accepts a string value", () => {
    expect(fromJson(str(), "hello", "s")).toBe("hello");
  });

  it("rejects a number", () => {
    expect(() => fromJson(str(), 42, "s")).toThrow(
      /Field 's': expected string, got number/,
    );
  });

  it("rejects null with a 'null' descriptor", () => {
    expect(() => fromJson(str(), null, "s")).toThrow(
      /Field 's': expected string, got null/,
    );
  });

  it("rejects array with an 'array' descriptor", () => {
    expect(() => fromJson(str(), ["a"], "s")).toThrow(
      /Field 's': expected string, got array/,
    );
  });
});

describe("fromJson: number", () => {
  it("accepts a number value", () => {
    expect(fromJson(num(), 42, "n")).toBe(42);
  });

  it("rejects a stringified number", () => {
    expect(() => fromJson(num(), "42", "n")).toThrow(
      /Field 'n': expected number, got string/,
    );
  });

  it("rejects NaN", () => {
    expect(() => fromJson(num(), NaN, "n")).toThrow(
      /Field 'n': expected number/,
    );
  });
});

describe("fromJson: boolean", () => {
  it("accepts true and false", () => {
    expect(fromJson(bool(), true, "b")).toBe(true);
    expect(fromJson(bool(), false, "b")).toBe(false);
  });

  it("rejects '0' / '1' strings (JSON has native booleans)", () => {
    expect(() => fromJson(bool(), "1", "b")).toThrow(
      /Field 'b': expected boolean/,
    );
    expect(() => fromJson(bool(), 0, "b")).toThrow(/expected boolean/);
  });
});

describe("fromJson: optional", () => {
  const f = opt(num(), 99);

  it("returns the value when present", () => {
    expect(fromJson(f, 5, "n")).toBe(5);
  });

  it("returns the default when undefined", () => {
    expect(fromJson(f, undefined, "n")).toBe(99);
  });

  it("recurses into inner for validation when value present", () => {
    expect(() => fromJson(f, "5", "n")).toThrow(/expected number/);
  });
});

describe("fromJson: literal", () => {
  const f = lit("CID");

  it("returns the literal value regardless of input", () => {
    expect(fromJson(f, undefined, "_")).toBe("CID");
    expect(fromJson(f, "anything", "_")).toBe("CID");
    expect(fromJson(f, 999, "_")).toBe("CID");
  });
});

describe("fromJson: nested", () => {
  const f = nested({ x: num(), y: num() });

  it("validates a well-formed object", () => {
    expect(fromJson(f, { x: 5, y: 3 }, "p")).toEqual({ x: 5, y: 3 });
  });

  it("rejects a non-object", () => {
    expect(() => fromJson(f, "not an object", "p")).toThrow(
      /Field 'p': expected object/,
    );
    expect(() => fromJson(f, null, "p")).toThrow(/expected object, got null/);
    expect(() => fromJson(f, [], "p")).toThrow(/expected object, got array/);
  });

  it("propagates sub-field errors with dotted path", () => {
    expect(() => fromJson(f, { x: "5", y: 3 }, "offset")).toThrow(
      /Field 'offset\.x': expected number/,
    );
    expect(() => fromJson(f, { x: 5, y: "3" }, "offset")).toThrow(
      /Field 'offset\.y'/,
    );
  });

  it("handles nested optionals with defaults", () => {
    const g = nested({ x: num(), y: opt(num(), 0) });
    expect(fromJson(g, { x: 5 }, "p")).toEqual({ x: 5, y: 0 });
  });

  it("handles deep nesting", () => {
    const deep = nested({ outer: nested({ inner: num() }) });
    expect(fromJson(deep, { outer: { inner: 7 } }, "d")).toEqual({
      outer: { inner: 7 },
    });
    expect(() => fromJson(deep, { outer: { inner: "x" } }, "d")).toThrow(
      /'d\.outer\.inner'/,
    );
  });
});

describe("fromJson: array", () => {
  const f = array(str());

  it("validates an array of strings", () => {
    expect(fromJson(f, ["a", "b", "c"], "list")).toEqual(["a", "b", "c"]);
  });

  it("rejects non-array values", () => {
    expect(() => fromJson(f, "not an array", "list")).toThrow(
      /Field 'list': expected array, got string/,
    );
    expect(() => fromJson(f, { 0: "a" }, "list")).toThrow(
      /expected array, got object/,
    );
  });

  it("propagates element errors with [i] index", () => {
    expect(() => fromJson(f, ["a", 2, "c"], "list")).toThrow(
      /Field 'list\[1\]': expected string/,
    );
  });

  it("handles array of nested objects", () => {
    const peers = array(nested({ uid: num(), name: str() }));
    const v = [
      { uid: 1, name: "Alice" },
      { uid: 2, name: "Bob" },
    ];
    expect(fromJson(peers, v, "peers")).toEqual(v);
    expect(() => fromJson(peers, [{ uid: 1 }], "peers")).toThrow(
      /'peers\[0\]\.name'/,
    );
  });

  it("handles empty array", () => {
    expect(fromJson(f, [], "list")).toEqual([]);
  });
});

describe("fromJson: custom", () => {
  it("uses identity by default", () => {
    const f = custom<{ raw: string }>({
      toFanta: (v) => v.raw,
      fromFanta: (t) => ({ raw: t }),
    });
    expect(fromJson(f, { raw: "x" }, "c")).toEqual({ raw: "x" });
  });

  it("dispatches to the user's fromJson hook when provided", () => {
    const f = custom<number>({
      toFanta: (n) => String(n),
      fromFanta: (t) => Number(t),
      fromJson: (v, name) => {
        if (typeof v !== "string") {
          throw new Error(`Field '${name}': must be a hex string`);
        }
        return parseInt(v.slice(2), 16);
      },
    });
    expect(fromJson(f, "0xff", "n")).toBe(255);
    expect(() => fromJson(f, 0xff, "n")).toThrow(/hex string/);
  });
});

// ---------------------------------------------------------------------
// toJson — identity for leaves, recurse for composites
// ---------------------------------------------------------------------

describe("toJson", () => {
  it("string/number/boolean are identity", () => {
    expect(toJson(str(), "hello")).toBe("hello");
    expect(toJson(num(), 42)).toBe(42);
    expect(toJson(bool(), true)).toBe(true);
  });

  it("optional is identity (value is already the right type)", () => {
    expect(toJson(opt(num(), 99), 5)).toBe(5);
  });

  it("literal is identity (caller of toJson never includes literals in envelope)", () => {
    // The schema walker strips literals before calling toJson; this
    // is just the field's behavior if called.
    expect(toJson(lit(0), 0 as unknown as never)).toBe(0);
  });

  it("nested recurses into sub-fields", () => {
    const f = nested({ x: num(), y: num() });
    expect(toJson(f, { x: 5, y: 3 })).toEqual({ x: 5, y: 3 });
  });

  it("array recurses into elements", () => {
    const f = array(num());
    expect(toJson(f, [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("array of nested round-trips through toJson", () => {
    const f = array(nested({ uid: num(), name: str() }));
    const v = [
      { uid: 1, name: "Alice" },
      { uid: 2, name: "Bob" },
    ];
    expect(toJson(f, v)).toEqual(v);
  });

  it("custom uses identity by default", () => {
    const f = custom<{ raw: string }>({
      toFanta: (v) => v.raw,
      fromFanta: (t) => ({ raw: t }),
    });
    expect(toJson(f, { raw: "x" })).toEqual({ raw: "x" });
  });

  it("custom uses the user's toJson when provided", () => {
    const f = custom<Date>({
      toFanta: (d) => String(d.getTime()),
      fromFanta: (t) => new Date(Number(t)),
      toJson: (d) => d.toISOString(),
      fromJson: (v) => new Date(v as string),
    });
    const d = new Date("2025-01-01T00:00:00.000Z");
    expect(toJson(f, d)).toBe("2025-01-01T00:00:00.000Z");
  });
});

// ---------------------------------------------------------------------
// Round-trip
// ---------------------------------------------------------------------

describe("toJson → fromJson round-trip", () => {
  it("scalars survive a round-trip", () => {
    expect(fromJson(str(), toJson(str(), "x"), "s")).toBe("x");
    expect(fromJson(num(), toJson(num(), 42), "n")).toBe(42);
    expect(fromJson(bool(), toJson(bool(), true), "b")).toBe(true);
  });

  it("nested objects survive a round-trip", () => {
    const f = nested({ x: num(), y: num() });
    expect(fromJson(f, toJson(f, { x: 5, y: 3 }), "p")).toEqual({ x: 5, y: 3 });
  });

  it("arrays of nested objects survive a round-trip", () => {
    const f = array(nested({ uid: num(), name: str() }));
    const v = [
      { uid: 1, name: "Alice" },
      { uid: 2, name: "Bob" },
    ];
    expect(fromJson(f, toJson(f, v), "peers")).toEqual(v);
  });
});
