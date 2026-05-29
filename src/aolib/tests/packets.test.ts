/**
 * Cross-packet smoke tests. The schema-level encode/decode/cast tests
 * already cover the wire-format primitives exhaustively; what this
 * file proves is that every registered schema is well-formed enough
 * to:
 *
 *   - round-trip a representative packet on both wire formats
 *   - be reachable via session.send.X / session.on.X for the right
 *     direction
 *
 * Plus a registry snapshot so additions / removals are visible in
 * diffs.
 */

import { describe, it, expect } from "bun:test";
import { encode } from "../encode";
import { decode } from "../decode";
import { c2sSchemas, s2cSchemas } from "../packets";
import { server, client } from "../session";

// ---------------------------------------------------------------------
// Registry snapshot — catches accidental removals on PR diffs.
// ---------------------------------------------------------------------

describe("registry shape", () => {
  it("c2sSchemas covers the expected headers", () => {
    expect(Object.keys(c2sSchemas).sort()).toEqual(
      [
        "AE", "AM", "AN", "CC", "CH", "CT", "DE", "EE", "HI", "HP",
        "MA", "MC", "MS", "PE", "RC", "RD", "RM", "RT", "VS_FRAME",
        "VS_JOIN", "VS_LEAVE", "VS_SPEAK", "ZZ", "askchaa",
      ].sort(),
    );
  });

  it("s2cSchemas covers the expected headers", () => {
    expect(Object.keys(s2cSchemas).sort()).toEqual(
      [
        "ASS", "AUTH", "BB", "BD", "BN", "CHECK", "CI", "CT",
        "CharsCheck", "DONE", "EI", "EM", "FA", "FL", "FM", "HP",
        "ID", "JD", "KB", "KK", "LE", "MC", "MS", "PN", "PR", "PU",
        "PV", "RMC", "RT", "SC", "SI", "SM", "SP", "TI",
        "VS_AUDIO", "VS_CAPS", "VS_JOIN", "VS_LEAVE", "VS_PEERS",
        "VS_SPEAK", "ZZ", "decryptor",
      ].sort(),
    );
  });

  it("every schema's $header matches its registry key", () => {
    // Bidirectional packets (MC, CT, HP, RT, ZZ, VS_*) intentionally
    // share a header across the two maps but may have different
    // shapes; what we verify here is just that the schema's own
    // $header field matches the key it was registered under.
    for (const [key, schema] of Object.entries(c2sSchemas)) {
      expect(schema.$header).toBe(key);
    }
    for (const [key, schema] of Object.entries(s2cSchemas)) {
      expect(schema.$header).toBe(key);
    }
  });
});

// ---------------------------------------------------------------------
// Round-trips for the new shapes (one representative per shape kind).
// ---------------------------------------------------------------------

describe("round-trips: scalar-only packets", () => {
  it("HP", () => {
    const p = { bar: 1, value: 8 };
    expect(decode(c2sSchemas.HP, encode(c2sSchemas.HP, p, "fanta"))).toEqual(p);
    expect(decode(c2sSchemas.HP, encode(c2sSchemas.HP, p, "json"))).toEqual(p);
  });

  it("MA (mod action)", () => {
    const p = { id: 42, duration: 60, reason: "spamming" };
    expect(decode(c2sSchemas.MA, encode(c2sSchemas.MA, p, "fanta"))).toEqual(p);
    expect(decode(c2sSchemas.MA, encode(c2sSchemas.MA, p, "json"))).toEqual(p);
  });

  it("TI", () => {
    const p = { timer_id: 1, command: 2, time: 60_000 };
    expect(decode(s2cSchemas.TI, encode(s2cSchemas.TI, p, "fanta"))).toEqual(p);
    expect(decode(s2cSchemas.TI, encode(s2cSchemas.TI, p, "json"))).toEqual(p);
  });
});

describe("round-trips: optional-with-default packets", () => {
  it("BN fills empty position when absent", () => {
    const out = decode(s2cSchemas.BN, encode(s2cSchemas.BN, { background: "court" }, "fanta"));
    expect(out).toEqual({ background: "court", position: "" });
  });

  it("RT fills judgeId=-1 when absent (fanta)", () => {
    const out = decode(s2cSchemas.RT, encode(s2cSchemas.RT, { animation: "testimony1" }, "fanta"));
    expect(out).toEqual({ animation: "testimony1", judgeId: -1 });
  });

  it("ZZ fills target=-1 when absent", () => {
    const out = decode(c2sSchemas.ZZ, encode(c2sSchemas.ZZ, { reason: "racism" }, "fanta"));
    expect(out).toEqual({ reason: "racism", target: -1 });
  });

  it("PN preserves all fields when provided", () => {
    const p = { player_count: 5, max_players: 100, server_description: "A test server" };
    expect(decode(s2cSchemas.PN, encode(s2cSchemas.PN, p, "fanta"))).toEqual(p);
  });
});

describe("round-trips: array packets", () => {
  it("FL (array of strings)", () => {
    const p = { features: ["yellowtext", "cccc_ic_support", "flipping"] };
    expect(decode(s2cSchemas.FL, encode(s2cSchemas.FL, p, "fanta"))).toEqual(p);
    expect(decode(s2cSchemas.FL, encode(s2cSchemas.FL, p, "json"))).toEqual(p);
  });

  it("VS_PEERS (array of numbers)", () => {
    const p = { uids: [1, 2, 3, 42] };
    expect(decode(s2cSchemas.VS_PEERS, encode(s2cSchemas.VS_PEERS, p, "fanta"))).toEqual(p);
    expect(decode(s2cSchemas.VS_PEERS, encode(s2cSchemas.VS_PEERS, p, "json"))).toEqual(p);
  });

  it("FA empty array", () => {
    const p: { areas: string[] } = { areas: [] };
    expect(decode(s2cSchemas.FA, encode(s2cSchemas.FA, p, "fanta"))).toEqual(p);
  });
});

describe("round-trips: nested packets", () => {
  it("EI (single nested)", () => {
    const p = {
      id: 3,
      details: {
        name: "Pistol",
        description: "The murder weapon",
        type: "weapon",
        image: "pistol.png",
      },
    };
    expect(decode(s2cSchemas.EI, encode(s2cSchemas.EI, p, "fanta"))).toEqual(p);
    expect(decode(s2cSchemas.EI, encode(s2cSchemas.EI, p, "json"))).toEqual(p);
  });

  it("LE (array of nested)", () => {
    const p = {
      evidence: [
        { name: "Pistol", description: "weapon", image: "pistol.png" },
        { name: "Letter", description: "evidence", image: "letter.png" },
      ],
    };
    expect(decode(s2cSchemas.LE, encode(s2cSchemas.LE, p, "fanta"))).toEqual(p);
    expect(decode(s2cSchemas.LE, encode(s2cSchemas.LE, p, "json"))).toEqual(p);
  });

  it("CI (incremental char info with (idx, data) pairs)", () => {
    const p = {
      batchIndex: 0,
      entries: [
        { index: 0, data: "Phoenix" },
        { index: 1, data: "Edgeworth" },
      ],
    };
    expect(decode(s2cSchemas.CI, encode(s2cSchemas.CI, p, "fanta"))).toEqual(p);
    expect(decode(s2cSchemas.CI, encode(s2cSchemas.CI, p, "json"))).toEqual(p);
  });
});

describe("round-trips: empty packets", () => {
  it("askchaa (c2s empty)", () => {
    expect(decode(c2sSchemas.askchaa, encode(c2sSchemas.askchaa, {}, "fanta"))).toEqual({});
    expect(decode(c2sSchemas.askchaa, encode(c2sSchemas.askchaa, {}, "json"))).toEqual({});
  });

  it("CHECK (s2c empty)", () => {
    expect(decode(s2cSchemas.CHECK, encode(s2cSchemas.CHECK, {}, "fanta"))).toEqual({});
  });
});

// ---------------------------------------------------------------------
// Session-level: every direction is callable.
// ---------------------------------------------------------------------

describe("session integration: new packets are reachable", () => {
  it("server.send.<C2S> works for the new c2s packets", () => {
    const out: string[] = [];
    const s = server({ send: (w) => out.push(w) });
    s.send.AE({ id: 0 });
    s.send.RC({});
    s.send.MA({ id: 1, duration: 60, reason: "spam" });
    s.send.VS_FRAME({ payload: "BASE64==" });
    expect(out).toEqual([
      "AE#0#%",
      "RC#%",
      "MA#1#60#spam#%",
      "VS_FRAME#BASE64==#%",
    ]);
  });

  it("server.on.<S2C> dispatches for the new s2c packets", () => {
    const s = server({ send: () => {} });
    const seen: Record<string, unknown> = {};
    s.on.BN((p) => { seen.BN = p; });
    s.on.SI((p) => { seen.SI = p; });
    s.on.FL((p) => { seen.FL = p; });
    s.on.VS_AUDIO((p) => { seen.VS_AUDIO = p; });
    s.receive("BN#court##%");
    s.receive("SI#10#5#20#%");
    s.receive("FL#a#b#%");
    s.receive("VS_AUDIO#3#abc==#%");
    expect(seen.BN).toEqual({ background: "court", position: "" });
    expect(seen.SI).toEqual({ char_cnt: 10, evi_cnt: 5, mus_cnt: 20 });
    expect(seen.FL).toEqual({ features: ["a", "b"] });
    expect(seen.VS_AUDIO).toEqual({ fromUid: 3, payload: "abc==" });
  });

  it("client.send.<S2C> works for the new s2c packets", () => {
    const out: string[] = [];
    const c = client({ send: (w) => out.push(w) });
    c.send.BN({ background: "court", position: "wit" });
    c.send.FL({ features: ["a", "b"] });
    expect(out).toEqual([
      "BN#court#wit#%",
      "FL#a#b#%",
    ]);
  });
});

// ---------------------------------------------------------------------
// Bidirectional packets: same header, different shapes.
// ---------------------------------------------------------------------

describe("bidirectional packets", () => {
  it("CT: c2s has no is_from_server, s2c does", () => {
    const out: string[] = [];
    const c = client({ send: (w) => out.push(w) });
    c.send.CT({ name: "Server", message: "hi", is_from_server: true });
    expect(out).toEqual(["CT#Server#hi#1#%"]);

    const s = server({ send: () => {} });
    let received: Record<string, unknown> | undefined;
    s.on.CT((p) => { received = p as Record<string, unknown>; });
    s.receive("CT#Server#hi#1#%");
    expect(received).toEqual({ name: "Server", message: "hi", is_from_server: true });

    // The c2s shape has no is_from_server field at all
    out.length = 0;
    const c2 = server({ send: (w) => out.push(w) });
    c2.send.CT({ name: "Phoenix", message: "objection" });
    expect(out).toEqual(["CT#Phoenix#objection#%"]);
  });

  it("VS_SPEAK: c2s has on only, s2c has uid+on", () => {
    const out: string[] = [];
    const sToServer = server({ send: (w) => out.push(w) });
    sToServer.send.VS_SPEAK({ on: true });
    expect(out).toEqual(["VS_SPEAK#1#%"]);

    out.length = 0;
    const sToClient = client({ send: (w) => out.push(w) });
    sToClient.send.VS_SPEAK({ uid: 5, on: false });
    expect(out).toEqual(["VS_SPEAK#5#0#%"]);
  });

  it("HP: symmetric — same schema works in both directions", () => {
    const fromS: string[] = [];
    const fromC: string[] = [];
    server({ send: (w) => fromS.push(w) }).send.HP({ bar: 1, value: 8 });
    client({ send: (w) => fromC.push(w) }).send.HP({ bar: 2, value: 5 });
    expect(fromS).toEqual(["HP#1#8#%"]);
    expect(fromC).toEqual(["HP#2#5#%"]);
  });
});

// ---------------------------------------------------------------------
// Chat-meta escaping survives through the registry.
// ---------------------------------------------------------------------

describe("chat-meta escaping is applied uniformly", () => {
  it("BB reason with # and & round-trips on fanta", () => {
    const p = { message: "Don't use #1 & $5 in chat" };
    const out = decode(s2cSchemas.BB, encode(s2cSchemas.BB, p, "fanta"));
    expect(out).toEqual(p);
  });

  it("CT message with chat-meta survives on fanta", () => {
    const p = { name: "Phoenix", message: "100% sure & #1!" };
    const out = decode(c2sSchemas.CT, encode(c2sSchemas.CT, p, "fanta"));
    expect(out).toEqual(p);
  });
});
