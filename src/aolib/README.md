# aolib

Self-contained TypeScript library for the Attorney Online protocol.

Owns every packet schema, both wire formats (fantacode + JSON), the
encode/decode logic, and the typed dispatch surface. Clients see only
typed sender functions and typed receive handlers — never wire bytes,
positional slots, literals, or format flags.

The library is dependency-free and transport-agnostic. You plug it into
a WebSocket (or anything that ships strings), it does the rest.

## Protocol reference

aolib tries to stay faithful to the official AO protocol documentation
at <https://github.com/AttorneyOnline/docs>. When a packet's behavior
on the wire is ambiguous in code, the docs there are the tiebreaker. If
behavior here ever drifts from what's documented upstream, it's a bug
in this library, not a deliberate fork.

That said, the docs occasionally lag the implementation in real-world
servers (and clients). Where field-level details diverge, the schema
file calls it out in a comment — e.g. CC's leading positional slot is
spec'd as a hardcoded `0` but webAO has historically sent the player
ID there. The library emits the spec value; the comment records the
historical drift.

## Usage

The library is used the same way on both sides of the wire. The unit
of work is a **session** — one logical connection with its own encoding
mode, its own handler registrations, and its own state. A session is
named for the **remote party**: a client constructs one `aolib.server`
representing the server it talks to; a server constructs one
`aolib.client` per accepted client.

The local role is inferred from the remote: in `server.send.MS(...)`
the server is the remote, so the local side (which is us, a client) is
the one sending. In `client.on.HI(...)` the client is the remote, so
the local side (the server) is the one receiving. Reads naturally at
the call site.

Two complete worked examples live alongside this README and typecheck
end-to-end:

- [`exampleClient.ts`](./exampleClient.ts) — browser client with one
  WebSocket, registering handlers for inbound server packets and
  sending packets back.
- [`exampleServer.ts`](./exampleServer.ts) — Node server using `ws`,
  one session per accepted connection, with a broadcast helper.

Both files are runnable spec: today the session bodies are stubs (every
`send.X` and `on.X` throws "not implemented"), but the typed surface is
locked. As schema/encode/decode/dispatch land, the examples start
working without changing.

The highlights:

- **Both sides use `session.on.X(handler)` and `session.send.X(packet)`
  with the same call shape.** Direction is what differs, not API.
- **The factory picks the typed namespace.** `aolib.server(...)` gives
  you `ServerSession.send.HI` (we send HI to the server) and
  `ServerSession.on.BB` (the server sends BB to us). `aolib.client(...)`
  gives the inverse. Wrong-direction calls don't compile.
- **Each session tracks its own encoding mode independently.** One
  client on JSON, another on fanta, connected to the same server,
  simultaneously — the library doesn't care.
- **Broadcast is one loop at the call site.** No library helper;
  fanning out depends on the caller's topology (area? room? all?) and
  the library has nothing to add.

## Public API

```ts
// Session factories — named for the REMOTE party. Pick the one that
// matches who's on the other end; the typed surface follows.

// Construct a session representing the server you're connected to.
// Used by client-side code (one per process).
aolib.server(config: SessionConfig): ServerSession

// Construct a session representing one client connected to you.
// Used by server-side code (one per accepted connection).
aolib.client(config: SessionConfig): ClientSession

interface SessionConfig {
  // Required: how we ship outbound bytes for this session.
  send: (wire: string) => void;

  // Optional: observability hooks. Default to console logging.
  onMalformedFrame?:  (err: Error, wire: string) => void;
  onUnknownHeader?:   (header: string, wire: string) => void;
  onDecodeError?:     (header: string, err: Error, wire: string) => void;
  onUnhandled?:       (header: string, packet: unknown) => void;
  onHandlerError?:    (header: string, err: Error, packet: unknown) => void;
}

// On every session:
session.receive(wire: string): void          // never throws; routes via hooks

session.send.<HEADER>(packet): void          // typed sender, role-aware
session.on.<HEADER>(handler): void           // typed receiver, role-aware

session.close(): void                        // detach all handlers, free state
```

Each session type exposes exactly the packets that direction sees:

- `ServerSession` (representing the server, used in client code):
  - `.send.<X>` where X is what a client sends: `HI`, `MS`, `MC`, `CC`,
    `CT`, ...
  - `.on.<X>` where X is what a server sends: `BB`, `PV`, `DONE`, `BN`,
    `ID`, `FL`, `SI`, ...

- `ClientSession` (representing one client, used in server code):
  - `.send.<X>` where X is what a server sends (same set as
    `ServerSession.on`).
  - `.on.<X>` where X is what a client sends (same set as
    `ServerSession.send`).

The mapping is derived from each schema's direction annotation in
`packets/`, so adding a new packet automatically adds it to the right
namespace on the right session type — no boilerplate to keep in sync.

Packet types are re-exported for handler signatures:

```ts
import type { MSPacket, MCPacket, PVPacket /* ... */ } from "./aolib";

function handleChatMessage(packet: MSPacket) { /* ... */ }
session.on.MS(handleChatMessage);
```

## Folder structure

```
aolib/
├── README.md                  ← you are here
├── index.ts                   ← public exports: bind, receive, on, send, types
├── transport.ts               ← bind() + receive() framing + dispatch
├── schema.ts                  ← packet() — builds a schema from fields
├── fields.ts                  ← str, num, bool, opt, lit, blob, custom
├── encode.ts                  ← fanta + JSON encode dispatch
├── decode.ts                  ← fanta + JSON decode + auto-detect
├── types.ts                   ← In<S> / Out<S> type derivation
├── packets/                   ← every AO packet schema lives here
│   ├── MS.ts                  ← export const MS = packet("MS", { ... });
│   ├── MC.ts
│   ├── CC.ts
│   ├── CT.ts
│   ├── PV.ts
│   ├── BB.ts
│   ├── AUTH.ts
│   └── ...
└── tests/
```

The `packets/` folder is the source of truth for the protocol. Each file
declares one packet's schema using the field primitives from `fields.ts`.
The top-level `index.ts` walks `packets/` to build the typed `ao.send.*`
and `ao.on.*` namespaces.

## Anatomy of a packet definition (for library contributors)

A packet file is one schema literal:

```ts
// packets/MC.ts
import { packet, str, num, opt } from "../schema";

export const MC = packet("MC", {
  name: str(),
  char_id: num(),
  showname: opt(str(), ""),
  effects: opt(num(), 0),
});

export type MCPacket = Out<typeof MC>;
```

The schema literal is the source of truth — types derive from it, the
library walks it at runtime, both can't disagree. Adding a packet means
one file. Editing a spec field means one line.

Wire-format quirks stay inside the schema via the field primitives:

```ts
// packets/CC.ts — leading `0` and trailing empty `char_pw` are
// spec-mandated literals, invisible to the caller.
export const CC = packet("CC", {
  _0: lit(0),
  char_id: num(),
  _pw: lit(""),
});

// Client passes only { char_id }; library emits CC#0#5##% on the wire.
export type CCPacket = Out<typeof CC>;
```

```ts
// packets/EI.ts — `name&description&type&image` packed into one
// positional slot in fanta, real nested object in JSON.
export const EI = packet("EI", {
  id: num(),
  body: blob({
    name: str(),
    description: str(),
    type: str(),
    image: str(),
  }),
});

encode(EI, { id: 1, body: { name: "Pistol", description: "...", type: "weapon", image: "pistol.png" } }, "fanta");
// → "EI#1#Pistol&...&weapon&pistol.png#%"

encode(EI, { ... }, "json");
// → '{"$header":"EI","id":1,"body":{"name":"Pistol","description":"...","type":"weapon","image":"pistol.png"}}'
```

For genuinely one-off weirdness, fall back to `custom(...)` at the
field level (preferred) or to a hand-rolled codec module under
`packets/` (last resort).

## Design principles

1. **Schema is data, not a class.** A schema is a literal object. Types
   derive from it via mapped types; the library walks it at runtime.
   They can't disagree because they read the same source.

2. **The client never sees wire concerns.** No positional slots, no
   literals, no escape characters, no fanta-vs-JSON flag. The library
   does the format work; the client works in typed objects.

3. **Wire-format weirdness lives in field primitives.** A new spec
   quirk that recurs across packets becomes a new primitive. Existing
   packets are untouched. Truly one-off weirdness uses `custom()`.

4. **JSON and fanta are peer wire formats.** The library has a mode
   knob but no preference. Adding a third format is implementing four
   methods (`toFmt3`, `fromFmt3`, etc.) on each primitive.

5. **Required, optional, and literal are field-level concerns.** One
   primitive per concept; composition (`opt(str(), "")`) builds the
   full shape.

6. **The library never touches transport, state, or modes.** It's pure
   `(schema, packet) ↔ string` plus a thin dispatch layer. The client
   wires it into whatever transport it has.

7. **Evolution is additive.** New packets, new field kinds, new wire
   formats, new directions — all extend rather than modify. Existing
   schemas and call sites are untouched.

## Guarantees

- **Wrong-direction calls fail loudly at both layers.** Registering a
  handler or calling a sender for a packet that doesn't belong on this
  session's role fails at compile time (the typed namespace doesn't
  expose the header) AND at runtime (the session throws with a clear
  message). The runtime guard exists for the case where TS is bypassed
  via `any` cast or the library is consumed from plain JavaScript.

  ```ts
  const server = aolib.server({ send: w => ws.send(w) });

  server.on.HI(() => {});
  //        ^^ TS error: HI is sent by clients, not received from server.
  //        At runtime, this also throws:
  //          aolib: cannot register on.HI on a ServerSession
  //          (HI is sent client → server; register it on a ClientSession instead)
  ```

  Symmetric on the sender side: `server.send.BB({...})` rejects at
  compile time and throws at runtime.

- **`receive(wire)` never throws.** All failure modes (malformed
  frames, unknown headers, decode errors, missing handlers, handlers
  throwing) route through the optional callbacks on `SessionConfig`.
  One inbound frame either runs a typed handler or invokes exactly one
  observability hook — never both, never neither.

- **Each session's encoding mode is independent.** A server with
  several connected clients can have some on fanta and some on JSON
  simultaneously, switching per-session via `decryptor#JSON#%`. No
  global mode state leaks between sessions.

- **Schemas don't disagree with types.** The schema literal is the
  source for both runtime walks and type-level derivations. There's
  no separate type declaration that can drift; if the field set
  changes, every consumer (sender, handler, encode, decode) updates
  through inference.

## What this library is not

- Not a client. It does not own a WebSocket, replay mode, DOM, character
  state, voice, or anything else. It owns packets and only packets.
- Not a Zod replacement for general-purpose validation. The field
  primitives are AO-specific (chat-escape coercion, positional literals).
- Not async. `send` and `receive` are synchronous string operations.
  Transport (WebSocket etc.) is the client's concern.
