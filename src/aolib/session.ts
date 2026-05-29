/**
 * Session: the role-typed, dispatch-driving surface aolib exposes.
 *
 * Two factories:
 *   `server(config)` — for client-side code; the session represents
 *     the remote *server*. `.send.<X>` ships C2S packets; `.on.<X>`
 *     registers handlers for S2C packets.
 *   `client(config)` — for server-side code; the session represents
 *     one remote *client*. `.send.<X>` ships S2C packets; `.on.<X>`
 *     registers handlers for C2S packets.
 *
 * Sessions are named for the *remote* party so that `client.send.MC`
 * reads as "send MC to the client". The role determines which direction
 * lookup we do at every `.send.X` / `.on.X` access — wrong-direction
 * calls fail at compile time AND runtime.
 *
 * Wire mode is per-session and starts at `"fanta"`. If the dispatcher
 * sees `{ value: "JSON" }` for the `decryptor` header it flips the
 * mode to `"json"` for all subsequent outbound packets.
 *
 *   transport bytes ─► receive(wire)
 *      │
 *      ├── readHeader(wire)                  ─── fail ─► onMalformedFrame
 *      ├── lookup schema in inbound map      ─── miss ─► onUnknownHeader
 *      ├── decode(schema, wire)              ─── fail ─► onDecodeError
 *      ├── if header === "decryptor" && value === "JSON" → mode = "json"
 *      ├── handler = handlers[header]        ─── miss ─► onUnhandled
 *      └── handler(packet)                   ─── throw ► onHandlerError
 *
 *   send.X(packet) ─► encode(outboundSchemas[X], packet, mode) ─► config.send(wire)
 */

import { encode, type WireMode } from "./encode";
import { decode, readHeader } from "./decode";
import { c2sSchemas, s2cSchemas, type C2SSchemas, type S2CSchemas } from "./packets";
import type { In, Out } from "./types";
import type { Schema } from "./schema";

// ---------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------

export interface SessionConfig {
  send(wire: string): void;
  onMalformedFrame?(err: Error, wire: string): void;
  onUnknownHeader?(header: string, wire: string): void;
  onDecodeError?(header: string, err: Error, wire: string): void;
  onUnhandled?(header: string, packet: unknown): void;
  onHandlerError?(header: string, err: Error, packet: unknown): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySchema = Schema<any>;

type Sender<S extends AnySchema> = (packet: In<S>) => void;
type HandlerRegistrar<S extends AnySchema> = (
  handler: (packet: Out<S>) => void,
) => void;

type SendMap<M extends Record<string, AnySchema>> = {
  [K in keyof M]: Sender<M[K]>;
};
type OnMap<M extends Record<string, AnySchema>> = {
  [K in keyof M]: HandlerRegistrar<M[K]>;
};

/** Returned from `server(config)`. Owns the C2S send side, S2C on side. */
export interface ServerSession {
  send: SendMap<C2SSchemas>;
  on: OnMap<S2CSchemas>;
  receive(wire: string): void;
  close(): void;
}

/** Returned from `client(config)`. Owns the S2C send side, C2S on side. */
export interface ClientSession {
  send: SendMap<S2CSchemas>;
  on: OnMap<C2SSchemas>;
  receive(wire: string): void;
  close(): void;
  area?: number;
}

// ---------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------

type Role = "client" | "server";

function makeSession(role: Role, config: SessionConfig): ServerSession & ClientSession {
  // role "server" → this represents the remote server → from us-as-client.
  //   outbound: C2S (we are the client speaking to the server)
  //   inbound: S2C
  // role "client" → this represents a remote client → from us-as-server.
  //   outbound: S2C
  //   inbound: C2S
  const outboundSchemas = role === "server" ? c2sSchemas : s2cSchemas;
  const inboundSchemas = role === "server" ? s2cSchemas : c2sSchemas;
  const oppositeOutbound = role === "server" ? s2cSchemas : c2sSchemas;
  const oppositeInbound = role === "server" ? c2sSchemas : s2cSchemas;

  let mode: WireMode = "fanta";
  let closed = false;
  const handlers: Record<string, (packet: unknown) => void> = {};

  const send = new Proxy({} as Record<string, (packet: unknown) => void>, {
    get: (_t, prop) => {
      if (typeof prop !== "string") return undefined;
      const header = prop;
      const schema = (outboundSchemas as Record<string, AnySchema>)[header];
      if (!schema) {
        if (header in oppositeOutbound) {
          throw wrongDirectionSendError(role, header);
        }
        throw new Error(`aolib: no schema registered for header '${header}'`);
      }
      return (packet: unknown) => {
        if (closed) {
          throw new Error(`aolib: send.${header} on a closed session`);
        }
        const wire = encode(schema, packet as Record<string, unknown>, mode);
        config.send(wire);
      };
    },
  });

  const on = new Proxy({} as Record<string, (handler: (packet: unknown) => void) => void>, {
    get: (_t, prop) => {
      if (typeof prop !== "string") return undefined;
      const header = prop;
      if (!(header in inboundSchemas)) {
        if (header in oppositeInbound) {
          throw wrongDirectionOnError(role, header);
        }
        throw new Error(`aolib: no schema registered for header '${header}'`);
      }
      return (handler: (packet: unknown) => void) => {
        handlers[header] = handler;
      };
    },
  });

  function receive(wire: string): void {
    if (closed) return;

    let header: string;
    try {
      header = readHeader(wire);
    } catch (err) {
      callHook(config.onMalformedFrame, err as Error, wire) ??
        defaultMalformedFrame(err as Error, wire);
      return;
    }

    const schema = (inboundSchemas as Record<string, AnySchema>)[header];
    if (!schema) {
      callHook(config.onUnknownHeader, header, wire) ??
        defaultUnknownHeader(header, wire);
      return;
    }

    let packet: Record<string, unknown>;
    try {
      packet = decode(schema, wire);
    } catch (err) {
      callHook(config.onDecodeError, header, err as Error, wire) ??
        defaultDecodeError(header, err as Error, wire);
      return;
    }

    // Mode-flip: once the server advertises JSON via `decryptor`, all
    // subsequent outbound packets from this session go on the JSON wire.
    if (header === "decryptor" && packet.value === "JSON") {
      mode = "json";
    }

    const handler = handlers[header];
    if (!handler) {
      callHook(config.onUnhandled, header, packet) ??
        defaultUnhandled(header, packet);
      return;
    }

    try {
      handler(packet);
    } catch (err) {
      callHook(config.onHandlerError, header, err as Error, packet) ??
        defaultHandlerError(header, err as Error, packet);
    }
  }

  function close(): void {
    closed = true;
    for (const k of Object.keys(handlers)) delete handlers[k];
  }

  return {
    send: send as unknown as SendMap<C2SSchemas> & SendMap<S2CSchemas>,
    on: on as unknown as OnMap<S2CSchemas> & OnMap<C2SSchemas>,
    receive,
    close,
  };
}

// ---------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------

function wrongDirectionSendError(role: Role, header: string): Error {
  if (role === "server") {
    return new Error(
      `aolib: server-session.send.${header} — '${header}' is server -> client. ` +
        `On a server session (representing the remote server), you can only send ` +
        `client -> server packets. Use client(config).send.${header} instead, or ` +
        `register a handler with server.on.${header}(...) to receive this packet.`,
    );
  }
  return new Error(
    `aolib: client-session.send.${header} — '${header}' is client -> server. ` +
      `On a client session (representing a remote client), you can only send ` +
      `server -> client packets. Use server(config).send.${header} instead, or ` +
      `register a handler with client.on.${header}(...) to receive this packet.`,
  );
}

function wrongDirectionOnError(role: Role, header: string): Error {
  if (role === "server") {
    return new Error(
      `aolib: server-session.on.${header} — '${header}' is client -> server. ` +
        `On a server session (representing the remote server), you can only ` +
        `register handlers for server -> client packets. Use client(config).on.${header} ` +
        `instead, or send the packet with server.send.${header}(...).`,
    );
  }
  return new Error(
    `aolib: client-session.on.${header} — '${header}' is server -> client. ` +
      `On a client session (representing a remote client), you can only register ` +
      `handlers for client -> server packets. Use server(config).on.${header} ` +
      `instead, or send the packet with client.send.${header}(...).`,
  );
}

// ---------------------------------------------------------------------
// Hook plumbing
// ---------------------------------------------------------------------

type Hook<A extends unknown[]> = (...args: A) => void;

function callHook<A extends unknown[]>(
  hook: Hook<A> | undefined,
  ...args: A
): true | undefined {
  if (!hook) return undefined;
  hook(...args);
  return true;
}

function defaultMalformedFrame(err: Error, wire: string): void {
  // eslint-disable-next-line no-console
  console.warn(
    `[aolib] malformed wire frame: ${err.message}\n  wire: ${truncate(wire)}`,
  );
}

function defaultUnknownHeader(header: string, wire: string): void {
  // eslint-disable-next-line no-console
  console.warn(
    `[aolib] unknown packet header '${header}' (no schema registered)\n  wire: ${truncate(wire)}`,
  );
}

function defaultDecodeError(header: string, err: Error, wire: string): void {
  // eslint-disable-next-line no-console
  console.warn(
    `[aolib] decode error for '${header}': ${err.message}\n  wire: ${truncate(wire)}`,
  );
}

function defaultUnhandled(header: string, _packet: unknown): void {
  // eslint-disable-next-line no-console
  console.warn(`[aolib] no handler registered for '${header}'`);
}

function defaultHandlerError(header: string, err: Error, _packet: unknown): void {
  // eslint-disable-next-line no-console
  console.error(`[aolib] handler for '${header}' threw: ${err.message}`);
}

function truncate(s: string, max = 200): string {
  return s.length <= max ? s : `${s.slice(0, max)}...`;
}

// ---------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------

export function server(config: SessionConfig): ServerSession {
  return makeSession("server", config);
}

export function client(config: SessionConfig): ClientSession {
  return makeSession("client", config);
}
