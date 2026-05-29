import { describe, it, expect } from "bun:test";
import { encode } from "../encode";
import { decode } from "../decode";
import { server } from "../session";
import { ARUP, AreaUpdateType, type AreaUpdateData } from "../packets/ARUP";
import type { Out } from "../types";

// ---------------------------------------------------------------------
// Discriminator: update_type drives the payload type.
// ---------------------------------------------------------------------

describe("ARUP: update_type discriminates payload", () => {
  it("PLAYER_COUNT carries numbers on the wire", () => {
    const wire = encode(
      ARUP,
      { update_type: AreaUpdateType.PLAYER_COUNT, update_data: [3, 7, 0] },
      "fanta",
    );
    expect(wire).toBe("ARUP#0#3#7#0#%");
    const decoded = decode(ARUP, wire) as Out<typeof ARUP>;
    expect(decoded.update_type).toBe(AreaUpdateType.PLAYER_COUNT);
    expect(decoded.update_data).toEqual([3, 7, 0]);
  });

  it("STATUS carries strings on the wire", () => {
    const wire = encode(
      ARUP,
      {
        update_type: AreaUpdateType.STATUS,
        update_data: ["normal", "casing", "battle"],
      },
      "fanta",
    );
    expect(wire).toBe("ARUP#1#normal#casing#battle#%");
    const decoded = decode(ARUP, wire) as Out<typeof ARUP>;
    expect(decoded.update_type).toBe(AreaUpdateType.STATUS);
    expect(decoded.update_data).toEqual(["normal", "casing", "battle"]);
  });

  it("CASE_MANAGER carries CM names", () => {
    const wire = encode(
      ARUP,
      {
        update_type: AreaUpdateType.CASE_MANAGER,
        update_data: ["Phoenix Wright", "", "Edgeworth"],
      },
      "fanta",
    );
    expect(decode(ARUP, wire)).toEqual({
      update_type: AreaUpdateType.CASE_MANAGER,
      update_data: ["Phoenix Wright", "", "Edgeworth"],
    });
  });

  it("LOCKED carries lock-state strings", () => {
    const wire = encode(
      ARUP,
      {
        update_type: AreaUpdateType.LOCKED,
        update_data: ["FREE", "LOCKED", "SPECTATABLE"],
      },
      "fanta",
    );
    expect(decode(ARUP, wire)).toEqual({
      update_type: AreaUpdateType.LOCKED,
      update_data: ["FREE", "LOCKED", "SPECTATABLE"],
    });
  });
});

// ---------------------------------------------------------------------
// Chat-meta escaping inside the string payload values.
// ---------------------------------------------------------------------

describe("ARUP: chat-escape on string payloads", () => {
  it("string values with #, &, %, $ survive a fanta round-trip", () => {
    const names = [
      "Wright & Co.",
      "100% sure #1",
      "Mod $5/h",
      "plain",
    ];
    const wire = encode(
      ARUP,
      { update_type: AreaUpdateType.CASE_MANAGER, update_data: names },
      "fanta",
    );
    const decoded = decode(ARUP, wire) as Out<typeof ARUP>;
    expect(decoded.update_data).toEqual(names);
  });

  it("strings are escaped on the wire, not just the typed shape", () => {
    const wire = encode(
      ARUP,
      {
        update_type: AreaUpdateType.STATUS,
        update_data: ["a & b"],
      },
      "fanta",
    );
    // The `&` must be `<and>` on the wire; otherwise the receiver-side
    // walker would treat it as a token boundary inside the slot.
    expect(wire).toBe("ARUP#1#a <and> b#%");
  });

  it("PLAYER_COUNT data is not escaped (just numbers)", () => {
    const wire = encode(
      ARUP,
      { update_type: AreaUpdateType.PLAYER_COUNT, update_data: [12, 0, 5] },
      "fanta",
    );
    expect(wire).toBe("ARUP#0#12#0#5#%");
  });
});

// ---------------------------------------------------------------------
// Empty / boundary cases.
// ---------------------------------------------------------------------

describe("ARUP: edge cases", () => {
  it("zero-length payload is allowed", () => {
    const wire = encode(
      ARUP,
      { update_type: AreaUpdateType.PLAYER_COUNT, update_data: [] as number[] },
      "fanta",
    );
    expect(wire).toBe("ARUP#0#%");
    const decoded = decode(ARUP, wire) as Out<typeof ARUP>;
    expect(decoded).toEqual({
      update_type: AreaUpdateType.PLAYER_COUNT,
      update_data: [],
    });
  });

  it("unknown update_type falls back to PLAYER_COUNT", () => {
    const decoded = decode(ARUP, "ARUP#9#1#2#3#%") as Out<typeof ARUP>;
    expect(decoded.update_type).toBe(AreaUpdateType.PLAYER_COUNT);
    expect(decoded.update_data).toEqual([1, 2, 3]);
  });

  it("non-numeric token in PLAYER_COUNT payload becomes 0", () => {
    // Player counts that fail to parse fall back to 0 rather than NaN
    // — handlers loop over them assuming finite numbers.
    const decoded = decode(ARUP, "ARUP#0#3#oops#5#%") as Out<typeof ARUP>;
    expect(decoded.update_data).toEqual([3, 0, 5]);
  });
});

// ---------------------------------------------------------------------
// JSON wire shape — discriminator is a number, payload is a native
// heterogeneous JSON array.
// ---------------------------------------------------------------------

describe("ARUP: JSON envelope", () => {
  it("PLAYER_COUNT encodes as a JSON object with number[] payload", () => {
    const json = encode(
      ARUP,
      { update_type: AreaUpdateType.PLAYER_COUNT, update_data: [3, 7] },
      "json",
    );
    expect(JSON.parse(json)).toEqual({
      $header: "ARUP",
      update_type: 0,
      update_data: [3, 7],
    });
  });

  it("STATUS encodes as a JSON object with string[] payload", () => {
    const json = encode(
      ARUP,
      {
        update_type: AreaUpdateType.STATUS,
        update_data: ["normal", "battle"],
      },
      "json",
    );
    expect(JSON.parse(json)).toEqual({
      $header: "ARUP",
      update_type: 1,
      update_data: ["normal", "battle"],
    });
  });

  it("JSON round-trips for every update_type", () => {
    const cases: { update_type: AreaUpdateType; update_data: AreaUpdateData }[] = [
      { update_type: AreaUpdateType.PLAYER_COUNT, update_data: [10, 20, 30] },
      { update_type: AreaUpdateType.STATUS, update_data: ["normal", "casing"] },
      { update_type: AreaUpdateType.CASE_MANAGER, update_data: ["Phoenix"] },
      { update_type: AreaUpdateType.LOCKED, update_data: ["FREE"] },
    ];
    for (const c of cases) {
      expect(decode(ARUP, encode(ARUP, c, "json"))).toEqual(c);
    }
  });
});

// ---------------------------------------------------------------------
// Session integration.
// ---------------------------------------------------------------------

describe("ARUP: session integration", () => {
  it("server.on.ARUP receives the typed packet", () => {
    const s = server({ send: () => {} });
    let received: Out<typeof ARUP> | undefined;
    s.on.ARUP((p) => {
      received = p;
    });
    s.receive("ARUP#1#normal#battle#%");
    expect(received).toEqual({
      update_type: AreaUpdateType.STATUS,
      update_data: ["normal", "battle"],
    });
  });
});
