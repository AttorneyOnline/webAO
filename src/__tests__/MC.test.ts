import { describe, it, expect } from "bun:test";
import { decode, encode } from "../packets";
import { MCPacketClient, MCPacketServer } from "../packets/MC";

/**
 * Round-trip: `decode(schema, encode(schema, packet))` should equal `packet`
 * for fully-populated packets, in both fanta and JSON wire formats.
 */
describe("MC encode/decode are inverses", () => {
  const clientPacket = {
    name: "track.opus",
    char_id: 5,
    showname: "Phoenix",
    looping: true,
    channel: 1,
    effects: 2,
  };

  const serverPacket = {
    name: "track.opus",
    char_id: 5,
    showname: "Phoenix",
    effects: 2,
  };

  it("MCPacketClient: fanta encode -> decode preserves values", () => {
    const wire = encode("MC", MCPacketClient, clientPacket, false);
    expect(decode(MCPacketClient, wire)).toEqual(clientPacket);
  });

  it("MCPacketClient: JSON encode -> decode preserves values", () => {
    const wire = encode("MC", MCPacketClient, clientPacket, true);
    expect(decode(MCPacketClient, wire)).toEqual(clientPacket);
  });

  it("MCPacketServer: fanta encode -> decode preserves values", () => {
    const wire = encode("MC", MCPacketServer, serverPacket, false);
    expect(decode(MCPacketServer, wire)).toEqual(serverPacket);
  });

  it("MCPacketServer: JSON encode -> decode preserves values", () => {
    const wire = encode("MC", MCPacketServer, serverPacket, true);
    expect(decode(MCPacketServer, wire)).toEqual(serverPacket);
  });

  it("partial packet is filled with class defaults on encode -> decode", () => {
    const partial = { name: "track.opus", char_id: 5 };
    const wire = encode("MC", MCPacketServer, partial, false);
    const decoded = decode(MCPacketServer, wire);
    expect(decoded.name).toBe("track.opus");
    expect(decoded.char_id).toBe(5);
    expect(decoded.showname).toBe("");
    expect(decoded.effects).toBe(0);
  });

  it("encode throws when a required field is missing", () => {
    expect(() => encode("MC", MCPacketServer, {}, false)).toThrow(
      /Missing required field/,
    );
  });

  it("decode throws when a required field is missing on the wire", () => {
    // Fanta wire with only the header — both required fields absent.
    expect(() => decode(MCPacketServer, "MC#%")).toThrow(/Missing required field/);
  });
});
