import { describe, it, expect } from "bun:test";
import { encode } from "../encode";
import { packet } from "../schema";
import { str, num, bool, opt, lit, nested, array } from "../fields";

// ---------------------------------------------------------------------
// Worked schemas — small enough to read, exercise every feature.
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
// JSON mode
// ---------------------------------------------------------------------

describe("encode: JSON mode", () => {
  it("emits canonical envelope with $header first", () => {
    expect(encode(MC, { name: "track", char_id: 5 }, "json")).toBe(
      '{"$header":"MC","name":"track","char_id":5,"showname":"","effects":0}',
    );
  });

  it("literals are stripped from the envelope (positional padding is wire-only)", () => {
    expect(encode(CC, { char_id: 5 }, "json")).toBe(
      '{"$header":"CC","char_id":5}',
    );
    expect(encode(PV, { player_id: 3, char_id: 7 }, "json")).toBe(
      '{"$header":"PV","player_id":3,"char_id":7}',
    );
  });

  it("optional fields with provided values keep them", () => {
    expect(
      encode(
        MC,
        { name: "track", char_id: 5, showname: "Phoenix", effects: 2 },
        "json",
      ),
    ).toBe(
      '{"$header":"MC","name":"track","char_id":5,"showname":"Phoenix","effects":2}',
    );
  });

  it("nested fields become real nested objects in JSON", () => {
    const FOO = packet("FOO", {
      offset: nested({ x: num(), y: num() }),
    });
    expect(encode(FOO, { offset: { x: 5, y: 3 } }, "json")).toBe(
      '{"$header":"FOO","offset":{"x":5,"y":3}}',
    );
  });

  it("array of nested becomes JSON array of objects", () => {
    expect(
      encode(
        VS_PEERS,
        {
          peers: [
            { uid: 1, name: "Alice" },
            { uid: 2, name: "Bob" },
          ],
        },
        "json",
      ),
    ).toBe(
      '{"$header":"VS_PEERS","peers":[{"uid":1,"name":"Alice"},{"uid":2,"name":"Bob"}]}',
    );
  });

  it("empty schema is just `{$header}`", () => {
    expect(encode(DONE, {}, "json")).toBe('{"$header":"DONE"}');
  });

  it("missing required field throws via cast", () => {
    expect(() => encode(MC, { name: "x" }, "json")).toThrow(
      /Missing required field 'char_id'/,
    );
  });
});

// ---------------------------------------------------------------------
// Fanta mode
// ---------------------------------------------------------------------

describe("encode: fanta mode", () => {
  it("emits canonical wire `HEADER#a#b#%`", () => {
    expect(encode(MC, { name: "track", char_id: 5 }, "fanta")).toBe(
      "MC#track#5##0#%",
    );
  });

  it("literals are emitted at their wire positions", () => {
    expect(encode(CC, { char_id: 5 }, "fanta")).toBe("CC#0#5##%");
    expect(encode(PV, { player_id: 3, char_id: 7 }, "fanta")).toBe(
      "PV#3#CID#7#%",
    );
  });

  it("optionals with defaults get filled before serialization", () => {
    // showname defaults to "", effects defaults to 0.
    expect(encode(MC, { name: "track", char_id: 5 }, "fanta")).toBe(
      "MC#track#5##0#%",
    );
  });

  it("empty schema is `HEADER#%`", () => {
    expect(encode(DONE, {}, "fanta")).toBe("DONE#%");
  });

  it("array expands to N positional slots, greedy at end of schema", () => {
    expect(encode(SM, { music_list: ["track1", "track2", "track3"] }, "fanta")).toBe(
      "SM#track1#track2#track3#%",
    );
  });

  it("empty array produces zero trailing args", () => {
    expect(encode(SM, { music_list: [] }, "fanta")).toBe("SM#%");
  });

  it("array of nested packs each element with `&` separator", () => {
    expect(
      encode(
        VS_PEERS,
        {
          peers: [
            { uid: 1, name: "Alice" },
            { uid: 2, name: "Bob" },
          ],
        },
        "fanta",
      ),
    ).toBe("VS_PEERS#1&Alice#2&Bob#%");
  });

  it("nested field packs into one positional slot", () => {
    const FOO = packet("FOO", {
      offset: nested({ x: num(), y: num() }),
    });
    expect(encode(FOO, { offset: { x: 5, y: 3 } }, "fanta")).toBe(
      "FOO#5&3#%",
    );
  });

  it("string with chat meta-chars is escaped", () => {
    expect(encode(MC, { name: "100% #1", char_id: 5 }, "fanta")).toBe(
      "MC#100<percent> <num>1#5##0#%",
    );
  });

  it("boolean values become 1 / 0 on the wire", () => {
    const ALERT = packet("ALERT", { silent: bool() });
    expect(encode(ALERT, { silent: true }, "fanta")).toBe("ALERT#1#%");
    expect(encode(ALERT, { silent: false }, "fanta")).toBe("ALERT#0#%");
  });
});

// ---------------------------------------------------------------------
// Schema-level override
// ---------------------------------------------------------------------

describe("encode: schema-level toArgs override (fanta path)", () => {
  it("dispatches to override when defined, bypassing the default walker", () => {
    const WEIRD = packet(
      "EI",
      {
        id: num(),
        name: str(),
        description: str(),
      },
      {
        toArgs: (p) => {
          const x = p as { id: number; name: string; description: string };
          return [String(x.id), `${x.name}&${x.description}`];
        },
      },
    );
    expect(
      encode(WEIRD, { id: 1, name: "Pistol", description: "fires" }, "fanta"),
    ).toBe("EI#1#Pistol&fires#%");
  });

  it("override is not used in JSON mode (JSON is keyed)", () => {
    const WEIRD = packet(
      "EI",
      {
        id: num(),
        name: str(),
      },
      {
        toArgs: () => {
          throw new Error("toArgs should not be called in JSON mode");
        },
      },
    );
    expect(encode(WEIRD, { id: 1, name: "Pistol" }, "json")).toBe(
      '{"$header":"EI","id":1,"name":"Pistol"}',
    );
  });
});
