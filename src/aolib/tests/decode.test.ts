import { describe, it, expect } from "bun:test";
import { decode } from "../decode";
import { encode } from "../encode";
import { packet } from "../schema";
import { str, num, bool, opt, lit, nested, array } from "../fields";

// ---------------------------------------------------------------------
// Worked schemas — same as encode.test.ts so round-trip tests work.
// ---------------------------------------------------------------------

const MC = packet("MC", {
  name: str(),
  char_id: num(),
  showname: opt(str(), ""),
  effects: opt(num(), 0),
});

const CC = packet("CC", {
  _0: lit(0),
  char_id: num(),
  _pw: lit(""),
});

const PV = packet("PV", {
  player_id: num(),
  _cid: lit("CID"),
  char_id: num(),
});

const DONE = packet("DONE", {});

const SM = packet("SM", {
  music_list: array(str()),
});

const VS_PEERS = packet("VS_PEERS", {
  peers: array(nested({ uid: num(), name: str() })),
});

// ---------------------------------------------------------------------
// Auto-detect
// ---------------------------------------------------------------------

describe("decode: format auto-detect", () => {
  it("`{` prefix routes to JSON path", () => {
    expect(decode(MC, '{"$header":"MC","name":"x","char_id":5}')).toEqual({
      name: "x",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });

  it("non-`{` prefix routes to fanta path", () => {
    expect(decode(MC, "MC#x#5##0#%")).toEqual({
      name: "x",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });
});

// ---------------------------------------------------------------------
// JSON decode
// ---------------------------------------------------------------------

describe("decode: JSON mode", () => {
  it("decodes scalars and fills defaults from cast", () => {
    expect(decode(MC, '{"$header":"MC","name":"x","char_id":5}')).toEqual({
      name: "x",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });

  it("respects provided optional values", () => {
    expect(
      decode(
        MC,
        '{"$header":"MC","name":"x","char_id":5,"showname":"P","effects":2}',
      ),
    ).toEqual({ name: "x", char_id: 5, showname: "P", effects: 2 });
  });

  it("literals are stripped from the result", () => {
    const out = decode(CC, '{"$header":"CC","char_id":5}');
    expect(out).toEqual({ char_id: 5 });
    expect("_0" in out).toBe(false);
    expect("_pw" in out).toBe(false);
  });

  it("nested objects round through fromJson + cast", () => {
    const FOO = packet("FOO", {
      offset: nested({ x: num(), y: num() }),
    });
    expect(decode(FOO, '{"$header":"FOO","offset":{"x":5,"y":3}}')).toEqual({
      offset: { x: 5, y: 3 },
    });
  });

  it("array of nested decodes element-by-element", () => {
    expect(
      decode(
        VS_PEERS,
        '{"$header":"VS_PEERS","peers":[{"uid":1,"name":"Alice"},{"uid":2,"name":"Bob"}]}',
      ),
    ).toEqual({
      peers: [
        { uid: 1, name: "Alice" },
        { uid: 2, name: "Bob" },
      ],
    });
  });

  it("type mismatch throws with field path", () => {
    expect(() =>
      decode(MC, '{"$header":"MC","name":"x","char_id":"not-a-number"}'),
    ).toThrow(/Field 'char_id': expected number/);
  });

  it("missing required field throws", () => {
    expect(() => decode(MC, '{"$header":"MC","name":"x"}')).toThrow(
      /Missing required field 'char_id'/,
    );
  });

  it("header mismatch throws", () => {
    expect(() =>
      decode(MC, '{"$header":"BB","message":"hi"}'),
    ).toThrow(/Wire header mismatch: expected 'MC', got 'BB'/);
  });

  it("malformed JSON throws with a helpful prefix", () => {
    expect(() => decode(MC, "{not really json}")).toThrow(/Invalid JSON wire/);
  });

  it("extra keys in the JSON envelope are silently dropped", () => {
    const out = decode(
      MC,
      '{"$header":"MC","name":"x","char_id":5,"extra":"junk"}',
    );
    expect(out).toEqual({ name: "x", char_id: 5, showname: "", effects: 0 });
    expect("extra" in out).toBe(false);
  });
});

// ---------------------------------------------------------------------
// Fanta decode
// ---------------------------------------------------------------------

describe("decode: fanta mode", () => {
  it("decodes canonical `HEADER#a#b#%`", () => {
    expect(decode(MC, "MC#x#5#showname#0#%")).toEqual({
      name: "x",
      char_id: 5,
      showname: "showname",
      effects: 0,
    });
  });

  it("accepts trailing `#` without `%`", () => {
    expect(decode(MC, "MC#x#5##0#")).toEqual({
      name: "x",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });

  it("accepts no terminator at all", () => {
    expect(decode(MC, "MC#x#5##0")).toEqual({
      name: "x",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });

  it("literals are consumed but stripped", () => {
    expect(decode(CC, "CC#0#5##%")).toEqual({ char_id: 5 });
  });

  it("decodes PV's CID literal between scalars", () => {
    expect(decode(PV, "PV#3#CID#7#%")).toEqual({
      player_id: 3,
      char_id: 7,
    });
  });

  it("forgiving on non-conforming literal values", () => {
    // Server sent non-zero at CC's literal slot; we ignore it.
    expect(decode(CC, "CC#9#5#anything#%")).toEqual({ char_id: 5 });
  });

  it("array consumes all remaining slots", () => {
    expect(decode(SM, "SM#a#b#c#%")).toEqual({
      music_list: ["a", "b", "c"],
    });
  });

  it("array of nested decodes element-by-element", () => {
    expect(decode(VS_PEERS, "VS_PEERS#1&Alice#2&Bob#%")).toEqual({
      peers: [
        { uid: 1, name: "Alice" },
        { uid: 2, name: "Bob" },
      ],
    });
  });

  it("empty schema decodes to `{}`", () => {
    expect(decode(DONE, "DONE#%")).toEqual({});
  });

  it("strings are unescaped through fromFanta", () => {
    expect(decode(MC, "MC#100<percent> <num>1#5##0#%")).toEqual({
      name: "100% #1",
      char_id: 5,
      showname: "",
      effects: 0,
    });
  });

  it("missing required field on the wire throws", () => {
    expect(() => decode(MC, "MC#%")).toThrow(/Missing required field 'name'/);
  });

  it("header mismatch throws", () => {
    expect(() => decode(MC, "BB#anything#%")).toThrow(
      /Wire header mismatch: expected 'MC', got 'BB'/,
    );
  });

  it("invalid number token throws with field name", () => {
    expect(() => decode(MC, "MC#x#abc##0#%")).toThrow(
      /Invalid number for field 'char_id'/,
    );
  });
});

// ---------------------------------------------------------------------
// Schema-level override
// ---------------------------------------------------------------------

describe("decode: schema-level fromArgs override (fanta path)", () => {
  it("dispatches to override when defined", () => {
    const WEIRD = packet(
      "EI",
      {
        id: num(),
        name: str(),
        description: str(),
      },
      {
        fromArgs: (args) => {
          const parts = (args[1] ?? "").split("&");
          return {
            id: Number(args[0]),
            name: parts[0],
            description: parts[1],
          };
        },
      },
    );
    expect(decode(WEIRD, "EI#1#Pistol&fires#%")).toEqual({
      id: 1,
      name: "Pistol",
      description: "fires",
    });
  });

  it("override is not used in JSON mode", () => {
    const WEIRD = packet(
      "EI",
      { id: num(), name: str() },
      {
        fromArgs: () => {
          throw new Error("fromArgs should not be called in JSON mode");
        },
      },
    );
    expect(decode(WEIRD, '{"$header":"EI","id":1,"name":"Pistol"}')).toEqual({
      id: 1,
      name: "Pistol",
    });
  });
});

// ---------------------------------------------------------------------
// Round-trip
// ---------------------------------------------------------------------

describe("encode → decode round-trip", () => {
  it("MC round-trips in JSON mode", () => {
    const v = { name: "track", char_id: 5, showname: "Phoenix", effects: 2 };
    expect(decode(MC, encode(MC, v, "json"))).toEqual(v);
  });

  it("MC round-trips in fanta mode", () => {
    const v = { name: "track", char_id: 5, showname: "Phoenix", effects: 2 };
    expect(decode(MC, encode(MC, v, "fanta"))).toEqual(v);
  });

  it("CC strips literals consistently in both modes", () => {
    const v = { char_id: 5 };
    expect(decode(CC, encode(CC, v, "json"))).toEqual(v);
    expect(decode(CC, encode(CC, v, "fanta"))).toEqual(v);
  });

  it("PV strips CID literal in both modes", () => {
    const v = { player_id: 3, char_id: 7 };
    expect(decode(PV, encode(PV, v, "json"))).toEqual(v);
    expect(decode(PV, encode(PV, v, "fanta"))).toEqual(v);
  });

  it("VS_PEERS (array of nested) round-trips", () => {
    const v = {
      peers: [
        { uid: 1, name: "Alice" },
        { uid: 2, name: "Bob" },
      ],
    };
    expect(decode(VS_PEERS, encode(VS_PEERS, v, "json"))).toEqual(v);
    expect(decode(VS_PEERS, encode(VS_PEERS, v, "fanta"))).toEqual(v);
  });

  it("SM (array of scalars) round-trips even when empty", () => {
    const empty: { music_list: string[] } = { music_list: [] };
    expect(decode(SM, encode(SM, empty, "json"))).toEqual(empty);
    expect(decode(SM, encode(SM, empty, "fanta"))).toEqual(empty);
  });

  it("DONE (empty schema) round-trips", () => {
    expect(decode(DONE, encode(DONE, {}, "json"))).toEqual({});
    expect(decode(DONE, encode(DONE, {}, "fanta"))).toEqual({});
  });

  it("chat meta-chars survive fanta round-trip", () => {
    const v = { name: "100% sure #1 & $5", char_id: 5 };
    const decoded = decode(MC, encode(MC, v, "fanta"));
    expect(decoded.name).toBe("100% sure #1 & $5");
  });
});
