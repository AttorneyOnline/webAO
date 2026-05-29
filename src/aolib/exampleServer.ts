/**
 * Example: aolib used from a Node server with many connected clients.
 *
 * Demonstrates the per-client session model: each accepted connection
 * gets its own `ClientSession`, with its own encoding mode, handlers,
 * and outbound transport. Sessions on the same server can be in
 * different formats simultaneously.
 *
 * Uses only the packets currently in the registry — once more schemas
 * land in `packets/`, more `.on.X` / `.send.X` calls become valid.
 */

import { aolib, type ClientSession } from "./index";

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
      player_number: clients.size,
      software: "LemmyAO-server",
      version: "1.0",
    });
    client.send.SM({ music_list: ["track1.mp3", "track2.mp3"] });
    client.send.DONE({});
  });

  client.on.CC((packet) => {
    client.send.PV({ player_id: 1, char_id: packet.char_id });
  });

  client.on.MC((packet) => {
    // Music change request — re-broadcast to every connected client
    // in the same area as a server-side MC announcement.
    broadcastMC(client.area ?? 0, packet, client);
  });
});

// ---------------------------------------------------------------------
// Broadcast helper. Lives in caller code by design — the library
// doesn't impose a topology (area? room? all?), so fanning out is one
// loop at the call site.
// ---------------------------------------------------------------------

function broadcastMC(
  area: number,
  request: { name: string; char_id: number },
  except?: ClientSession,
): void {
  for (const peer of clients) {
    if (peer === except) continue;
    if (peer.area === area) {
      peer.send.MC({
        name: request.name,
        char_id: request.char_id,
      });
    }
  }
}
