/**
 * Example: aolib used from a browser client.
 *
 * Demonstrates the intended public surface for client-side code. Runs
 * once the schema/encode/decode/dispatch implementation lands; today
 * the session bodies are stubs (every send/on call throws).
 *
 * Read this file top-to-bottom — it's documentation that also
 * typechecks.
 */

import { aolib, type MSPacket, type MCPacket } from "./index";

// ---------------------------------------------------------------------
// Application state and stub helpers — what real client code would
// already have. Defined here so the example is self-contained.
// ---------------------------------------------------------------------

const state = { charID: -1 };

function getHardwareID(): string { return "stub-hwid"; }
function appendChat(_character: string, _text: string): void {}
function playMusic(_track: string, _channel: number): void {}
function loadCharacter(_charId: number): void {}

// In a browser this is `globalThis.WebSocket`; types come from `lib.dom`.
declare const WebSocket: { new (url: string): {
  send(data: string): void;
  onmessage: ((e: { data: string }) => void) | null;
} };

// ---------------------------------------------------------------------
// Setup.
// ---------------------------------------------------------------------

const ws = new WebSocket("wss://lemmy.example.com");

// One session, representing the server we're talking to.
const server = aolib.server({
  send: (wire) => ws.send(wire),

  // Loud during development — quietly dropping unhandled packets is
  // easy to miss when a handler regresses.
  onUnhandled: (header, packet) => {
    console.warn(`[aolib] no handler registered for ${header}`, packet);
  },
});

// Feed every inbound WebSocket frame to the session. Never throws.
ws.onmessage = (e) => server.receive(e.data);

// ---------------------------------------------------------------------
// Register handlers for packets the SERVER sends us.
// Fully typed, defaults filled, literals stripped.
// ---------------------------------------------------------------------

server.on.MS((packet: MSPacket) => {
  appendChat(packet.character, packet.text);
});

server.on.MC((packet: MCPacket) => {
  // packet.showname defaults to "" if the server omitted it.
  playMusic(packet.name, packet.channel);
});

server.on.BB((packet) => alert(packet.message));
server.on.PV((packet) => loadCharacter(packet.char_id));

// ---------------------------------------------------------------------
// Send packets TO the server. TS enforces input shape per header.
// ---------------------------------------------------------------------

server.send.HI({ hdid: getHardwareID() });

export function onEnterChat(text: string): void {
  server.send.MS({
    msg_type: "1",
    pre: "phoenix-confident",
    character: "Phoenix",
    text,
    side: "def",
    // ... other required MS fields
  });
}

export function onMusicListClick(track: string): void {
  server.send.MC({ name: track, char_id: state.charID });
}
