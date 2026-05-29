import { describe, it, expect } from "bun:test";
import {
  str,
  num,
  bool,
  opt,
  lit,
  nested,
  array,
  custom,
} from "../fields";

// ---------------------------------------------------------------------
// str()
// ---------------------------------------------------------------------

describe("str()", () => {
  const f = str();

  it("kind is 'string'", () => {
    expect(f.kind).toBe("string");
  });

  it("toFanta returns the value unchanged for plain ASCII", () => {
    expect(f.toFanta("hello world")).toBe("hello world");
  });

  it("fromFanta returns the value unchanged for plain ASCII", () => {
    expect(f.fromFanta("hello world", "field")).toBe("hello world");
  });

  it("escapes # and & and % and $ on toFanta", () => {
    expect(f.toFanta("a#b&c%d$e")).toBe("a<num>b<and>c<percent>d<dollar>e");
  });

  it("unescapes the same tokens on fromFanta", () => {
    expect(f.fromFanta("a<num>b<and>c<percent>d<dollar>e", "field")).toBe(
      "a#b&c%d$e",
    );
  });

  it("round-trips meta-chars", () => {
    const input = "trial 1: 100% odds & a hash# $5";
    expect(f.fromFanta(f.toFanta(input), "field")).toBe(input);
  });

  it("decodes \\uXXXX unicode escapes on fromFanta", () => {
    expect(f.fromFanta("\\u0041\\u0042", "field")).toBe("AB");
  });

  it("handles empty strings", () => {
    expect(f.toFanta("")).toBe("");
    expect(f.fromFanta("", "field")).toBe("");
  });
});

// ---------------------------------------------------------------------
// num()
// ---------------------------------------------------------------------

describe("num()", () => {
  const f = num();

  it("kind is 'number'", () => {
    expect(f.kind).toBe("number");
  });

  it("round-trips positive integers", () => {
    expect(f.fromFanta(f.toFanta(42), "n")).toBe(42);
  });

  it("round-trips negative integers", () => {
    expect(f.fromFanta(f.toFanta(-7), "n")).toBe(-7);
  });

  it("round-trips zero", () => {
    expect(f.fromFanta(f.toFanta(0), "n")).toBe(0);
  });

  it("round-trips floats", () => {
    expect(f.fromFanta(f.toFanta(3.14), "n")).toBe(3.14);
  });

  it("throws on empty token", () => {
    expect(() => f.fromFanta("", "n")).toThrow(
      /Invalid number for field 'n': empty token/,
    );
  });

  it("throws on non-numeric token", () => {
    expect(() => f.fromFanta("abc", "n")).toThrow(
      /Invalid number for field 'n': "abc"/,
    );
  });

  it("error message includes the field name verbatim", () => {
    expect(() => f.fromFanta("", "char_id")).toThrow(/'char_id'/);
  });
});

// ---------------------------------------------------------------------
// bool()
// ---------------------------------------------------------------------

describe("bool()", () => {
  const f = bool();

  it("kind is 'boolean'", () => {
    expect(f.kind).toBe("boolean");
  });

  it("true → '1', false → '0' on toFanta", () => {
    expect(f.toFanta(true)).toBe("1");
    expect(f.toFanta(false)).toBe("0");
  });

  it("'1' → true, '0' → false on fromFanta", () => {
    expect(f.fromFanta("1", "b")).toBe(true);
    expect(f.fromFanta("0", "b")).toBe(false);
  });

  it("throws on tokens other than '0' or '1'", () => {
    expect(() => f.fromFanta("true", "b")).toThrow(
      /Invalid boolean for field 'b'/,
    );
    expect(() => f.fromFanta("2", "b")).toThrow(/Invalid boolean/);
    expect(() => f.fromFanta("", "b")).toThrow(/Invalid boolean/);
  });
});

// ---------------------------------------------------------------------
// opt()
// ---------------------------------------------------------------------

describe("opt()", () => {
  const f = opt(str(), "fallback");

  it("kind is 'optional'", () => {
    expect(f.kind).toBe("optional");
  });

  it("stores the inner field", () => {
    expect(f.inner.kind).toBe("string");
  });

  it("stores the default value", () => {
    expect(f.default).toBe("fallback");
  });

  it("delegates fromFanta to inner", () => {
    expect(f.fromFanta("hello", "s")).toBe("hello");
  });

  it("delegates toFanta to inner", () => {
    expect(f.toFanta("hello")).toBe("hello");
  });

  it("inner can be any other field type", () => {
    const n = opt(num(), 99);
    expect(n.inner.kind).toBe("number");
    expect(n.default).toBe(99);
    expect(n.fromFanta("42", "n")).toBe(42);
  });
});

// ---------------------------------------------------------------------
// lit()
// ---------------------------------------------------------------------

describe("lit()", () => {
  it("kind is 'literal' for number value", () => {
    const f = lit(0);
    expect(f.kind).toBe("literal");
    expect(f.value).toBe(0);
  });

  it("kind is 'literal' for string value", () => {
    const f = lit("CID");
    expect(f.kind).toBe("literal");
    expect(f.value).toBe("CID");
  });

  it("kind is 'literal' for boolean value", () => {
    const f = lit(true);
    expect(f.kind).toBe("literal");
    expect(f.value).toBe(true);
  });

  it("literal value is preserved verbatim — walkers never call its codecs", () => {
    // The schema walkers (fanta + JSON) emit `value` directly and skip
    // these codecs entirely. Their existence is an implementation
    // detail of the Field<T> shape; not a callable contract.
    expect(lit(0).value).toBe(0);
    expect(lit("CID").value).toBe("CID");
    expect(lit(true).value).toBe(true);
  });
});

// ---------------------------------------------------------------------
// nested()
// ---------------------------------------------------------------------

describe("nested()", () => {
  const f = nested({ x: num(), y: num() });

  it("kind is 'nested'", () => {
    expect(f.kind).toBe("nested");
  });

  it("default separator is '&'", () => {
    expect(f.separator).toBe("&");
  });

  it("custom separator is honored", () => {
    const g = nested({ a: str(), b: str() }, ":");
    expect(g.separator).toBe(":");
    expect(g.toFanta({ a: "hi", b: "bye" })).toBe("hi:bye");
  });

  it("toFanta packs sub-fields with separator", () => {
    expect(f.toFanta({ x: 5, y: 3 })).toBe("5&3");
  });

  it("fromFanta unpacks correctly", () => {
    expect(f.fromFanta("5&3", "offset")).toEqual({ x: 5, y: 3 });
  });

  it("round-trips", () => {
    const v = { x: 100, y: -50 };
    expect(f.fromFanta(f.toFanta(v), "offset")).toEqual(v);
  });

  it("propagates sub-field errors with dotted path", () => {
    expect(() => f.fromFanta("abc&3", "offset")).toThrow(/'offset\.x'/);
    expect(() => f.fromFanta("5&abc", "offset")).toThrow(/'offset\.y'/);
  });

  it("handles strings with the separator-character escaped through inner", () => {
    // str() escapes '&' to '<and>', so a string sub-field with '&'
    // in its value still round-trips through the nested packing.
    const g = nested({ a: str(), b: str() });
    const v = { a: "a&b", b: "c" };
    expect(g.fromFanta(g.toFanta(v), "x")).toEqual(v);
  });
});

// ---------------------------------------------------------------------
// array()
// ---------------------------------------------------------------------

describe("array()", () => {
  const f = array(str());

  it("kind is 'array'", () => {
    expect(f.kind).toBe("array");
  });

  it("stores the element field", () => {
    expect(f.element.kind).toBe("string");
  });

  it("per-token fromFanta throws (walker handles arrays)", () => {
    expect(() => f.fromFanta("anything", "list")).toThrow(
      /array field 'list' must be consumed by the schema walker/,
    );
  });

  it("per-token toFanta throws", () => {
    expect(() => f.toFanta([])).toThrow(/consumed by the schema walker/);
  });

  it("element can be a nested field", () => {
    const g = array(nested({ uid: num(), name: str() }));
    expect(g.element.kind).toBe("nested");
  });
});

// ---------------------------------------------------------------------
// custom()
// ---------------------------------------------------------------------

describe("custom()", () => {
  const f = custom<number>({
    toFanta: (n) => `0x${n.toString(16)}`,
    fromFanta: (token, name) => {
      if (!token.startsWith("0x")) {
        throw new Error(`Field '${name}': expected hex prefix`);
      }
      return parseInt(token.slice(2), 16);
    },
  });

  it("kind is 'custom'", () => {
    expect(f.kind).toBe("custom");
  });

  it("stores and dispatches the user's fanta codecs", () => {
    expect(f.toFanta(255)).toBe("0xff");
    expect(f.fromFanta("0xff", "n")).toBe(255);
  });

  it("user codec errors propagate", () => {
    expect(() => f.fromFanta("nope", "n")).toThrow(/expected hex prefix/);
  });

  it("JSON hooks are optional and not required", () => {
    expect(f.fromJson).toBeUndefined();
    expect(f.toJson).toBeUndefined();
  });

  it("JSON hooks are stored when provided", () => {
    const g = custom<Date>({
      toFanta: (d) => String(d.getTime()),
      fromFanta: (t) => new Date(Number(t)),
      toJson: (d) => d.toISOString(),
      fromJson: (v) => new Date(v as string),
    });
    expect(typeof g.toJson).toBe("function");
    expect(typeof g.fromJson).toBe("function");
  });
});
