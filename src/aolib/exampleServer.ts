/**
 * Example: aolib used from a Node server with many connected clients.
 *
 * Demonstrates the per-client session model: each accepted connection
 * gets its own `ClientSession`, with its own encoding mode, handlers,
 * and outbound transport. Sessions on the same server can be in
 * different formats simultaneously.
 *
 * Read this file top-to-bottom. Runs once aolib's runtime is real.
 */

import { aolib, type ClientSession, type MSPacket } from "./index";

// ---------------------------------------------------------------------
// Minimal inline declarations for the Node `ws` package's
// `WebSocketServer` API. The real example would do
// `import { WebSocketServer } from "ws"`. Inline here so this file
// typechecks without `ws` being installed.
// ---------------------------------------------------------------------

interface WSConnection {
  send(data: string): void;
  on(event: "message", listener: (data: { toString(): string }) => void): void;
  on(event: "close", listener: () => void): void;
}
interface WSS {
  on(event: "connection", listener: (ws: WSConnection) => void): void;
}
declare const WebSocketServer: { new (opts: { port: number }): WSS };

// ---------------------------------------------------------------------
// Server state.
// ---------------------------------------------------------------------

const clients = new Set<ClientSession>();
const wss = new WebSocketServer({ port: 8080 });

// ---------------------------------------------------------------------
// Per-connection setup. One `aolib.client(...)` session per accepted
// WebSocket — the session represents that particular remote client.
// ---------------------------------------------------------------------

wss.on("connection", (ws) => {
  const client = aolib.client({
    send: (wire) => ws.send(wire),

    onUnhandled: (header, packet) => {
      console.warn(`[aolib] no handler for ${header} from client`, packet);
    },
  });

  clients.add(client);
  ws.on("close", () => clients.delete(client));
  ws.on("message", (data) => client.receive(data.toString()));

  // Advertise wire-format support. If THIS particular client echoes
  // back in JSON, THIS session auto-flips to JSON for outbound. Other
  // sessions keep whatever format their respective client picked.
  client.send.decryptor({ value: "JSON" });

  // -------------------------------------------------------------------
  // Handlers — what the server does with packets received FROM this
  // particular client.
  // -------------------------------------------------------------------

  client.on.HI((_packet) => {
    client.send.ID({
      player_count: clients.size,
      software: "LemmyAO-server",
      version: "1.0",
    });
    client.send.FL({
      features: ["fastloading", "noencryption"],
    });
  });

  client.on.CC((packet) => {
    // packet: CCPacket — only { char_id } on the public type.
    // (The spec literal `0` and deprecated char_pw slot are sealed
    //  inside the CC schema; we never see them here.)
    client.send.PV({ player_id: 1, char_id: packet.char_id });
  });

  client.on.MS((packet: MSPacket) => {
    // Chat message — re-broadcast to other clients in the same area.
    broadcastIC(client.area ?? 0, packet, client);
  });

  client.on.CT((packet) => {
    for (const peer of clients) {
      if (peer !== client) peer.send.CT(packet);
    }
  });
});

// ---------------------------------------------------------------------
// Broadcast helper. Lives in caller code by design — the library
// doesn't impose a topology (area? room? all?), so fanning out is one
// loop at the call site.
// ---------------------------------------------------------------------

function broadcastIC(
  area: number,
  packet: MSPacket,
  except?: ClientSession,
): void {
  for (const peer of clients) {
    if (peer === except) continue;
    if (peer.area === area) peer.send.MS(packet);
  }
}
