import { describe, it, expect } from "bun:test";
import { decode, encode, Packet, req } from "../packets";

// Synthetic schemas exercise the encode/decode mechanics independent of
// any real packet. Keep them small and focused.

class AllRequired extends Packet {
  static $header = "ALLREQ";
  s = req("string");
  n = req("number");
  b = req("boolean");
}

class AllOptional extends Packet {
  static $header = "ALLOPT";
  s = "hi";
  n = 42;
  b = true;
}

class Mixed extends Packet {
  static $header = "MIX";
  s = req("string");
  n = 99;
  b = false;
}

class Empty extends Packet {
  static $header = "EMPTY";
}

describe("encode: fanta wire shape", () => {
  it("zero-field schema produces `HEADER#%`", () => {
    expect(encode(Empty, {}, false)).toBe("EMPTY#%");
  });

  it("populated schema produces `HEADER#a#b#c#%`", () => {
    expect(encode(AllOptional, { s: "x", n: 7, b: false }, false)).toBe(
      "ALLOPT#x#7#0#%",
    );
  });

  it("emits fields in class declaration order", () => {
    // Pass values in reverse order; wire still follows declaration order.
    const wire = encode(AllOptional, { b: true, n: 1, s: "a" }, false);
    expect(wire).toBe("ALLOPT#a#1#1#%");
  });

  it("booleans encode as 1/0", () => {
    expect(encode(AllOptional, { s: "", n: 0, b: true }, false)).toBe("ALLOPT##0#1#%");
    expect(encode(AllOptional, { s: "", n: 0, b: false }, false)).toBe("ALLOPT##0#0#%");
  });
});

describe("encode: JSON wire shape", () => {
  it("wraps in `$header` envelope", () => {
    expect(encode(Empty, {}, true)).toBe('{"$header":"EMPTY"}');
  });

  it("serializes all field types natively", () => {
    expect(encode(AllOptional, { s: "x", n: 7, b: false }, true)).toBe(
      '{"$header":"ALLOPT","s":"x","n":7,"b":false}',
    );
  });
});

describe("encode: required-field gauntlet", () => {
  it("throws when a required field is missing", () => {
    expect(() => encode(AllRequired, { s: "x", n: 1 }, false)).toThrow(
      /Missing required field 'b'/,
    );
  });

  it("throws on the first missing required field, regardless of format", () => {
    expect(() => encode(AllRequired, {}, true)).toThrow(/Missing required field/);
  });
});

describe("encode: defaults from class initializers", () => {
  it("fills missing optional fields with class defaults (fanta)", () => {
    const wire = encode(Mixed, { s: "x" }, false);
    expect(wire).toBe("MIX#x#99#0#%");
  });

  it("fills missing optional fields with class defaults (JSON)", () => {
    const wire = encode(Mixed, { s: "x" }, true);
    expect(wire).toBe('{"$header":"MIX","s":"x","n":99,"b":false}');
  });
});

describe("decode: fanta terminator variants", () => {
  it("accepts canonical `HEADER#a#b#%`", () => {
    expect(decode(AllOptional, "ALLOPT#x#7#1#%")).toEqual({ s: "x", n: 7, b: true });
  });

  it("accepts trailing `#` only (no `%`)", () => {
    expect(decode(AllOptional, "ALLOPT#x#7#1#")).toEqual({ s: "x", n: 7, b: true });
  });

  it("accepts no terminator at all", () => {
    expect(decode(AllOptional, "ALLOPT#x#7#1")).toEqual({ s: "x", n: 7, b: true });
  });

  it("accepts the canonical zero-field wire `HEADER#%`", () => {
    expect(decode(Empty, "EMPTY#%")).toEqual({});
  });
});

describe("decode: type coercion", () => {
  it("booleans coerce from 1/0", () => {
    expect(decode(AllOptional, "ALLOPT#x#0#1#%").b).toBe(true);
    expect(decode(AllOptional, "ALLOPT#x#0#0#%").b).toBe(false);
  });

  it("numbers coerce via Number()", () => {
    expect(decode(AllOptional, "ALLOPT#x#-42#0#%").n).toBe(-42);
    expect(decode(AllOptional, "ALLOPT#x#3.14#0#%").n).toBe(3.14);
  });
});

describe("decode: required-field gauntlet", () => {
  it("throws when a required field is absent from the fanta wire", () => {
    // Header only — all three required fields missing.
    expect(() => decode(AllRequired, "ALLREQ#%")).toThrow(/Missing required field/);
  });

  it("throws when a required field is absent from the JSON envelope", () => {
    expect(() => decode(AllRequired, '{"$header":"ALLREQ","s":"x"}')).toThrow(
      /Missing required field/,
    );
  });
});

describe("decode: defaults backfill on the wire side", () => {
  it("fanta wire with missing optional fields uses class defaults", () => {
    // Only the required field provided.
    expect(decode(Mixed, "MIX#x#%")).toEqual({ s: "x", n: 99, b: false });
  });

  it("JSON with missing optional fields uses class defaults", () => {
    expect(decode(Mixed, '{"$header":"MIX","s":"x"}')).toEqual({
      s: "x",
      n: 99,
      b: false,
    });
  });
});

describe("decode: JSON $header is stripped from the result", () => {
  it("does not leak the `$header` key onto the typed packet", () => {
    const packet = decode(AllOptional, '{"$header":"ALLOPT","s":"x","n":1,"b":true}');
    expect("$header" in packet).toBe(false);
  });
});

describe("decode: strict shape", () => {
  it("drops unknown JSON fields the schema doesn't declare", () => {
    const packet = decode(
      AllOptional,
      '{"$header":"ALLOPT","s":"x","n":1,"b":true,"extra":"junk","other":42}',
    );
    expect(packet).toEqual({ s: "x", n: 1, b: true });
    expect("extra" in packet).toBe(false);
    expect("other" in packet).toBe(false);
  });

  it("drops extra fanta positional fields past the schema's field count", () => {
    // AllOptional has 3 fields; supply 5.
    const packet = decode(AllOptional, "ALLOPT#x#1#1#junk#more#%");
    expect(packet).toEqual({ s: "x", n: 1, b: true });
  });

  it("the result has exactly the schema's keys, no more no less", () => {
    const packet = decode(AllOptional, "ALLOPT#x#1#1#%");
    expect(Object.keys(packet).sort()).toEqual(["b", "n", "s"]);
  });
});

describe("encode -> decode round-trip", () => {
  for (const schema of [AllRequired, AllOptional, Mixed, Empty]) {
    const seed =
      schema === AllRequired ? { s: "hello", n: 7, b: true }
      : schema === AllOptional ? { s: "x", n: 3, b: false }
      : schema === Mixed ? { s: "x" }
      : {};

    it(`${schema.name}: fanta round-trip is identity (with defaults filled)`, () => {
      const wire = encode(schema, seed, false);
      const back = decode(schema, wire);
      // After encode, defaults are baked in; compare against a
      // defaults-filled expectation by re-encoding once more.
      expect(encode(schema, back as Partial<typeof seed>, false)).toBe(wire);
    });

    it(`${schema.name}: JSON round-trip is identity (with defaults filled)`, () => {
      const wire = encode(schema, seed, true);
      const back = decode(schema, wire);
      expect(encode(schema, back as Partial<typeof seed>, true)).toBe(wire);
    });
  }
});

describe("encode: strict shape", () => {
  it("drops extra partial keys not declared on the schema (fanta)", () => {
    const wire = encode(
      AllOptional,
      { s: "x", n: 1, b: true, extra: "junk" } as Partial<AllOptional>,
      false,
    );
    expect(wire).toBe("ALLOPT#x#1#1#%");
  });

  it("drops extra partial keys not declared on the schema (JSON)", () => {
    const wire = encode(
      AllOptional,
      { s: "x", n: 1, b: true, extra: "junk" } as Partial<AllOptional>,
      true,
    );
    expect(wire).toBe('{"$header":"ALLOPT","s":"x","n":1,"b":true}');
  });
});

describe("empty string handling", () => {
  it("empty string in an optional field round-trips through fanta", () => {
    const wire = encode(AllOptional, { s: "", n: 1, b: true }, false);
    expect(wire).toBe("ALLOPT##1#1#%");
    expect(decode(AllOptional, wire).s).toBe("");
  });

  it("empty string in an optional field round-trips through JSON", () => {
    const wire = encode(AllOptional, { s: "", n: 1, b: true }, true);
    expect(decode(AllOptional, wire).s).toBe("");
  });

  it("empty token in middle position decodes to empty string", () => {
    expect(decode(AllOptional, "ALLOPT##42#1#%")).toEqual({ s: "", n: 42, b: true });
  });

  it("required string field accepts empty string as provided", () => {
    // `""` is not undefined, so it satisfies the required check.
    expect(encode(AllRequired, { s: "", n: 0, b: false }, false)).toBe("ALLREQ##0#0#%");
    expect(decode(AllRequired, "ALLREQ##0#0#%")).toEqual({ s: "", n: 0, b: false });
  });
});

describe("JSON: native values pass through without coercion", () => {
  it("native `false` decodes to literal false (not derived from a default)", () => {
    // AllOptional.b defaults to true; explicit false in JSON must win.
    const packet = decode(AllOptional, '{"$header":"ALLOPT","s":"x","n":1,"b":false}');
    expect(packet.b).toBe(false);
  });

  it("native `0` decodes to literal 0 (not treated as missing)", () => {
    // AllOptional.n defaults to 42; explicit 0 in JSON must win.
    const packet = decode(AllOptional, '{"$header":"ALLOPT","s":"x","n":0,"b":true}');
    expect(packet.n).toBe(0);
  });

  it("native empty string decodes to literal '' (not treated as missing)", () => {
    // AllOptional.s defaults to "hi"; explicit "" in JSON must win.
    const packet = decode(AllOptional, '{"$header":"ALLOPT","s":"","n":1,"b":true}');
    expect(packet.s).toBe("");
  });
});

describe("decode: fanta partial fill (mid-count)", () => {
  it("provided optional fields are kept; missing ones fall to defaults", () => {
    // AllOptional has 3 fields; provide only the first two.
    expect(decode(AllOptional, "ALLOPT#x#7#%")).toEqual({ s: "x", n: 7, b: true });
  });
});

describe("decode: strict type coercion", () => {
  it("empty token in a number position throws", () => {
    expect(() => decode(Mixed, "MIX#x##0#%")).toThrow(
      /Invalid number for field 'n': empty token/,
    );
  });

  it("non-numeric token in a number position throws", () => {
    expect(() => decode(AllOptional, "ALLOPT#x#notanumber#1#%")).toThrow(
      /Invalid number for field 'n'/,
    );
  });

  it("non-0/1 token in a boolean position throws", () => {
    expect(() => decode(AllOptional, "ALLOPT#x#1#yes#%")).toThrow(
      /Invalid boolean for field 'b'/,
    );
  });

  it("empty token in a boolean position throws", () => {
    expect(() => decode(AllOptional, "ALLOPT#x#1##%")).toThrow(
      /Invalid boolean for field 'b'/,
    );
  });

  it("empty token in a string position is valid (strings can be empty)", () => {
    expect(decode(AllOptional, "ALLOPT##1#1#%").s).toBe("");
  });
});

describe("encode -> decode round-trip: chat escapes (fanta only)", () => {
  // Fanta strings get escapeFanta / unescapeFanta at the codec boundary so
  // wire meta-characters (`#`, `&`, `%`, `$`) survive.
  it("strings with `#` round-trip through fanta", () => {
    const wire = encode(Mixed, { s: "a#b#c" }, false);
    expect(decode(Mixed, wire).s).toBe("a#b#c");
  });

  it("strings with `%` round-trip through fanta", () => {
    const wire = encode(Mixed, { s: "100%" }, false);
    expect(decode(Mixed, wire).s).toBe("100%");
  });

  it("strings with `&` round-trip through fanta", () => {
    const wire = encode(Mixed, { s: "a&b" }, false);
    expect(decode(Mixed, wire).s).toBe("a&b");
  });

  it("strings with `$` round-trip through fanta", () => {
    const wire = encode(Mixed, { s: "$5" }, false);
    expect(decode(Mixed, wire).s).toBe("$5");
  });
});
