/**
 * Public entry point for aolib.
 *
 * Re-exports the session factories and the packet types. Right now the
 * factories are stubs — they typecheck against the intended public API
 * so the example files (and any future client code) can compile, but
 * the runtime is `not yet implemented` until the schema/encode/decode/
 * dispatch glue lands.
 *
 * As real implementation arrives, the bodies of `server()` / `client()`
 * become real; the public type signatures should not change.
 */

// ---------------------------------------------------------------------
// Field primitives (already implemented).
// ---------------------------------------------------------------------

export {
  str,
  num,
  bool,
  opt,
  lit,
  nested,
  array,
  custom,
  type Field,
  type FieldKind,
  type ScalarField,
  type OptionalField,
  type LiteralField,
  type NestedField,
  type NestedValue,
  type ArrayField,
  type CustomField,
} from "./fields";

// ---------------------------------------------------------------------
// JSON walker (library-side).
// ---------------------------------------------------------------------

export { fromJson, toJson } from "./json";

// ---------------------------------------------------------------------
// Schema builder.
// ---------------------------------------------------------------------

export {
  packet,
  type Fields,
  type Schema,
  type SchemaOverrides,
} from "./schema";

// ---------------------------------------------------------------------
// Session config + the five observability hooks.
// ---------------------------------------------------------------------

export interface SessionConfig {
  /** Required: how we ship outbound bytes for this session. */
  send(wire: string): void;

  /** Optional: hooks for each receive failure mode. Default to console. */
  onMalformedFrame?(err: Error, wire: string): void;
  onUnknownHeader?(header: string, wire: string): void;
  onDecodeError?(header: string, err: Error, wire: string): void;
  onUnhandled?(header: string, packet: unknown): void;
  onHandlerError?(header: string, err: Error, packet: unknown): void;
}

// ---------------------------------------------------------------------
// Placeholder packet types. Real types come from the schemas in
// `packets/` once those land — each schema file will export its
// `XPacket` type, and `index.ts` will re-export them. For now `unknown`
// keeps the examples honest (they treat packets as opaque).
// ---------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPacket = any;
export type MSPacket = AnyPacket;
export type MCPacket = AnyPacket;
export type CCPacket = AnyPacket;
export type CTPacket = AnyPacket;
export type HIPacket = AnyPacket;
export type IDPacket = AnyPacket;
export type FLPacket = AnyPacket;
export type BBPacket = AnyPacket;
export type BNPacket = AnyPacket;
export type BDPacket = AnyPacket;
export type PVPacket = AnyPacket;
export type DONEPacket = AnyPacket;
export type DecryptorPacket = AnyPacket;

// ---------------------------------------------------------------------
// Session types.
//
// `ServerSession` is what a client constructs to represent the server
// it talks to. `ClientSession` is what a server constructs (one per
// accepted connection) to represent a connected client.
//
// `.send.<HEADER>` and `.on.<HEADER>` are role-typed namespaces. The
// loose `Record<string, ...>` typing here is a placeholder; once the
// schema registry exists, these become exact key-typed maps so wrong-
// direction calls fail at compile time.
// ---------------------------------------------------------------------

type SendRegistry = Record<string, (packet: AnyPacket) => void>;
type OnRegistry = Record<string, (handler: (packet: AnyPacket) => void) => void>;

export interface ServerSession {
  /** Send a packet to the server. */
  send: SendRegistry;
  /** Register a handler for a packet the server sends us. */
  on: OnRegistry;
  /** Feed an inbound wire frame from the transport. Never throws. */
  receive(wire: string): void;
  /** Detach all handlers, free state. */
  close(): void;
}

export interface ClientSession {
  /** Send a packet to this client. */
  send: SendRegistry;
  /** Register a handler for a packet this client sends us. */
  on: OnRegistry;
  /** Feed an inbound wire frame from the transport. Never throws. */
  receive(wire: string): void;
  /** Detach all handlers, free state. */
  close(): void;
  /** Per-session state owned by the application — example only. */
  area?: number;
}

// ---------------------------------------------------------------------
// Session factories.
//
// `aolib.server(config)` — for client-side code; represents the server.
// `aolib.client(config)` — for server-side code; represents one client.
// ---------------------------------------------------------------------

function makeStubSession(role: "client" | "server"): ServerSession & ClientSession {
  // Stub throws on any access. The real implementation will validate
  // the header against this role's send / receive registry and throw
  // the "wrong direction" error if the header doesn't belong here.
  // Until then, every access throws the same not-implemented message
  // tagged with the role so misuse is visible immediately.
  const notImplemented = (op: "send" | "on", header: string | symbol) => () => {
    throw new Error(
      `aolib: ${role}-session.${op}.${String(header)} — runtime not implemented yet. ` +
      `When implemented, this will validate that '${String(header)}' is a valid ` +
      `${op === "send" ? "outbound" : "inbound"} packet for a ${role}-session ` +
      `and throw a wrong-direction error otherwise.`,
    );
  };
  return {
    send: new Proxy({} as SendRegistry, {
      get: (_t, header) => notImplemented("send", header),
    }),
    on: new Proxy({} as OnRegistry, {
      get: (_t, header) => notImplemented("on", header),
    }),
    receive: () => {},
    close: () => {},
  };
}

export function server(_config: SessionConfig): ServerSession {
  return makeStubSession("server");
}

export function client(_config: SessionConfig): ClientSession {
  return makeStubSession("client");
}

/**
 * Convenience namespace so both `import { server, client }` and
 * `import { aolib }` styles work.
 */
export const aolib = { server, client };
