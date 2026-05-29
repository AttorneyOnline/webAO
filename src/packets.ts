import { unescapeUnicode, escapeFanta, unescapeFanta } from "./escaping";
import { ARUP, receiveARUP } from "./packets/ARUP";
import { askchaa, receiveaskchaa } from "./packets/askchaa";
import { receiveASS } from "./packets/ASS";
import { receiveAUTH } from "./packets/AUTH";
import { receiveBB } from "./packets/BB";
import { receiveBD } from "./packets/BD";
import { BN, receiveBN } from "./packets/BN";
import { receiveCC, sendCC } from "./packets/CC";
import { CH, receiveCH, sendCH } from "./packets/CH";
import { CharsCheck, receiveCharsCheck } from "./packets/CharsCheck";
import { receiveCHECK } from "./packets/CHECK";
import { CI, receiveCI } from "./packets/CI";
import { CT, receiveCT, sendCT } from "./packets/CT";
import { DE, sendDE } from "./packets/DE";
import { receivedecryptor } from "./packets/decryptor";
import { receiveDONE } from "./packets/DONE";
import { EE, sendEE } from "./packets/EE";
import { EI, receiveEI } from "./packets/EI";
import { EM, receiveEM } from "./packets/EM";
import { FA, receiveFA } from "./packets/FA";
import { FL, receiveFL } from "./packets/FL";
import { FM, receiveFM } from "./packets/FM";
import { HI, receiveHI } from "./packets/HI";
import { HP, receiveHP, sendHP } from "./packets/HP";
import { IDClient, receiveID } from "./packets/ID";
import { receiveJD } from "./packets/JD";
import { receiveKB } from "./packets/KB";
import { receiveKK } from "./packets/KK";
import { LE, receiveLE } from "./packets/LE";
import { MA, sendMA } from "./packets/MA";
import { receiveMC, sendMC } from "./packets/MC";
import { receiveMM } from "./packets/MM";
import { MSClient, MSServer, receiveMS, sendMS } from "./packets/MS";
import { PE, sendPE } from "./packets/PE";
import { PN, receivePN } from "./packets/PN";
import { receivePR } from "./packets/PR";
import { PU, receivePU } from "./packets/PU";
import { receivePV, sendPV } from "./packets/PV";
import { receiveRC, sendRC } from "./packets/RC";
import { receiveRD, sendRD } from "./packets/RD";
import { receiveRM, sendRM } from "./packets/RM";
import { RMC, receiveRMC } from "./packets/RMC";
import { RT, receiveRT, sendRT } from "./packets/RT";
import { SC, receiveSC } from "./packets/SC";
import { SI, receiveSI } from "./packets/SI";
import { SM, receiveSM } from "./packets/SM";
import { SP, receiveSP } from "./packets/SP";
import { receiveTI } from "./packets/TI";
import { VS_AUDIO, receiveVS_AUDIO } from "./packets/VS_AUDIO";
import { VS_CAPS, receiveVS_CAPS } from "./packets/VS_CAPS";
import { VS_JOINClient, receiveVS_JOIN } from "./packets/VS_JOIN";
import { VS_LEAVEClient, receiveVS_LEAVE } from "./packets/VS_LEAVE";
import { VS_PEERS, receiveVS_PEERS } from "./packets/VS_PEERS";
import { VS_SPEAKClient, receiveVS_SPEAK } from "./packets/VS_SPEAK";
import { ZZ, receiveZZ, sendZZ } from "./packets/ZZ";

// ---------- New schema-driven API ----------

export type FieldType = "string" | "number" | "boolean";

/**
 * Field schema (object-array form). `default` (when present) makes the
 * field optional — used when the wire / JSON omits the value. Without
 * `default`, the field is required and `decode` throws if missing.
 */
export interface Field {
  name: string;
  type: FieldType;
  default?: unknown;
}

const coerce = (raw: string, t: FieldType, name: string): unknown => {
  if (t === "string") return unescapeUnicode(unescapeFanta(raw));
  if (t === "number") {
    // `Number("")` returns 0 in JS, which would mask an empty token as a
    // valid value. Reject empty + non-numeric tokens explicitly.
    if (raw === "") throw new Error(`Invalid number for field '${name}': empty token`);
    const n = Number(raw);
    if (Number.isNaN(n)) throw new Error(`Invalid number for field '${name}': ${JSON.stringify(raw)}`);
    return n;
  }
  if (raw !== "0" && raw !== "1") {
    throw new Error(`Invalid boolean for field '${name}': ${JSON.stringify(raw)}`);
  }
  return raw === "1";
};

const serialize = (v: unknown, t: FieldType): string =>
  t === "string" ? escapeFanta(v as string)
  : t === "number" ? String(v)
  : v ? "1" : "0";

// ---------- Class-based schema sentinel ----------

const REQ = Symbol("required");
interface ReqMarker { [REQ]: FieldType; }

// Memoised sentinels so `new MCPacketClient()` doesn't allocate on every decode.
const REQ_STRING: ReqMarker = { [REQ]: "string" };
const REQ_NUMBER: ReqMarker = { [REQ]: "number" };
const REQ_BOOLEAN: ReqMarker = { [REQ]: "boolean" };

/**
 * Marks a class field as required. At compile time the return type is
 * the actual field type (so the class is usable as a TS type); at runtime
 * it's a sentinel that `decode` recognises and either fills from the wire
 * or throws on missing.
 */
export function req(t: "string"): string;
export function req(t: "number"): number;
export function req(t: "boolean"): boolean;
export function req(t: FieldType): unknown {
  return t === "string" ? REQ_STRING : t === "number" ? REQ_NUMBER : REQ_BOOLEAN;
}

const isReq = (v: unknown): v is ReqMarker =>
  typeof v === "object" && v !== null && REQ in v;

const LIT = Symbol("literal");
interface LitMarker { [LIT]: string | number | boolean; }

/**
 * Brand type for wire-only literal fields. The actual runtime value is a
 * `{ [LIT]: value }` sentinel; this type-level brand lets `Wire<T>`
 * detect and strip the literal field from the public-facing API.
 */
export type Literal = { readonly __literal__: true };

/**
 * Marks a class field as a wire-only literal. Used for fanta positional
 * slots that the spec hardcodes to a fixed value (e.g. CC's leading `0`)
 * but that aren't part of the typed packet API. The field is emitted at
 * its declared wire position on encode, the position is consumed but
 * dropped on decode, and `cast` removes it from the typed result.
 *
 * `Wire<T>` strips the literal-typed fields from the input/output of
 * `encode`/`decode`, so callers never see `_zero` and friends.
 */
export function lit(value: string | number | boolean): Literal;
export function lit(value: string | number | boolean): unknown {
  return { [LIT]: value };
}

/**
 * Strips wire-only literal fields from a packet schema type, leaving
 * only the fields callers care about.
 */
export type Wire<T> = {
  [K in keyof T as T[K] extends Literal ? never : K]: T[K];
};

const isLit = (v: unknown): v is LitMarker =>
  typeof v === "object" && v !== null && LIT in v;

import { Packet } from "./Packet";
export { Packet };

/** A packet schema: a class whose field initializers describe the wire. */
export type Schema<T extends Packet> = new () => T;

/**
 * Walk a schema's declared fields in wire order, yielding `(name, type)`
 * pairs. Instantiates the class once to read the field initializers
 * (defaults + `req()` sentinels) and reports the declared type for each.
 */
function* walkSchema<T extends Packet>(
  SchemaClass: Schema<T>,
): Generator<{ name: string; type: FieldType; literal?: string | number | boolean }> {
  const exemplar = new SchemaClass();
  for (const [name, val] of Object.entries(exemplar)) {
    if (isReq(val)) yield { name, type: val[REQ] };
    else if (isLit(val)) yield { name, type: typeof val[LIT] as FieldType, literal: val[LIT] };
    else yield { name, type: typeof val as FieldType };
  }
}

/**
 * The "type gauntlet" — shared by `encode` and `decode`. Instantiate the
 * class (which runs field initializers for defaults + `req()` sentinels),
 * overlay only declared fields from the partial, then throw if any
 * required field is still a sentinel. Extra keys in the partial are
 * silently dropped — the schema is the source of truth for shape.
 */
function cast<T extends Packet>(SchemaClass: Schema<T>, partial: Partial<T>): T {
  const instance: Packet = new SchemaClass();
  const bag = partial as Packet;
  for (const name of Object.keys(instance)) {
    // Literal fields are wire-only placeholders; drop them from the
    // typed result and don't accept overrides from the caller.
    if (isLit(instance[name])) {
      delete instance[name];
      continue;
    }
    if (bag[name] !== undefined) instance[name] = bag[name];
    if (isReq(instance[name])) throw new Error(`Missing required field '${name}'`);
  }
  return instance as T;
}

/**
 * Parse a wire body into a typed packet. Auto-detects format: bodies that
 * start with `{` are JSON envelopes (`{"$header":"HEADER",...}`); anything
 * else is positional `HEADER#a#b#%`. Runs the type gauntlet: missing
 * optional fields get their `default`; missing required fields throw.
 */
export function decode<T extends Packet>(schema: Schema<T>, body: string): Wire<T> {
  let partial: Packet;
  if (body.startsWith("{")) {
    partial = JSON.parse(body);
  } else {
    partial = {} as Packet;
    const specs = [...walkSchema<T>(schema)];
    // Accept `HEADER#a#b#%` (canonical), `HEADER#a#b#`, or `HEADER#a#b`
    // by peeling each terminator char if present.
    let trimmed = body;
    if (trimmed.endsWith("%")) trimmed = trimmed.slice(0, -1);
    if (trimmed.endsWith("#")) trimmed = trimmed.slice(0, -1);
    const args = trimmed.split("#");
    specs.forEach((f, i) => {
      // Literal slots take a wire position but don't store onto the result.
      if (f.literal !== undefined) return;
      const v = args[i + 1];
      if (v !== undefined) partial[f.name] = coerce(v, f.type, f.name);
    });
  }
  return cast<T>(schema, partial as Partial<T>) as Wire<T>;
}

/**
 * Serialize a typed packet to wire bytes. Reads the header from
 * `SchemaClass.$header` (matches the JSON envelope key). Pure library
 * function — callers pass in the format they want. Runs the same type
 * gauntlet as `decode` (defaults filled, required validated).
 */
export function encode<T extends Packet>(
  SchemaClass: Schema<T> & { $header: string },
  packet: Partial<Wire<T>>,
  asJson: boolean = false,
): string {
  const full = cast<T>(SchemaClass, packet as Partial<T>);
  if (asJson) {
    return JSON.stringify({ $header: SchemaClass.$header, ...full });
  }
  const parts = [...walkSchema<T>(SchemaClass)].map((f) =>
    f.literal !== undefined ? serialize(f.literal, f.type) : serialize(full[f.name], f.type),
  );
  // Zero-field packets are spec'd as `HEADER#%`, not `HEADER##%`.
  if (parts.length === 0) return `${SchemaClass.$header}#%`;
  return `${SchemaClass.$header}#${parts.join("#")}#%`;
}

// ---------- Legacy codec API (kept until all packets migrate) ----------

/**
 * A codec for a single packet header. `decode` parses the `#`-split args
 * (with args[0] being the header) into a typed packet. `encode` serializes
 * a typed packet back to the wire format, including the trailing `#%`.
 */
export interface PacketCodec<TPacket> {
  header: string;
  fields?: readonly Field[];
  decode(args: string[]): TPacket;
  encode?(packet: TPacket): string;
}

export type FieldSpec = Field;

const zeroFor = (t: FieldType): unknown =>
  t === "string" ? "" : t === "number" ? 0 : false;

/**
 * Legacy factory bundling header+fields into a `PacketCodec` object. New
 * packets should use the free `decode`/`encode` functions directly.
 */
export function makeCodec<T>(
  header: string,
  fields: readonly Field[],
): PacketCodec<T> {
  return {
    header,
    fields,
    decode(args) {
      const out: Record<string, unknown> = {};
      fields.forEach((f, i) => {
        const v = args[i + 1];
        if (v === undefined) {
          out[f.name] = f.default ?? zeroFor(f.type);
          return;
        }
        if (f.type === "string") out[f.name] = unescapeFanta(v);
        else if (f.type === "number") out[f.name] = Number(v);
        else out[f.name] = v === "1";
      });
      return out as T;
    },
    encode(packet) {
      const parts: string[] = fields.map((f) => {
        let v = (packet as Record<string, unknown>)[f.name];
        if (v === undefined) v = f.default ?? zeroFor(f.type);
        if (f.type === "string") return escapeFanta(v as string);
        if (f.type === "number") return String(v);
        return v ? "1" : "0";
      });
      return `${header}#${parts.join("#")}#%`;
    },
  };
}

function fillDefaults<T>(fields: readonly Field[], partial: Partial<T>): T {
  const out: Record<string, unknown> = { ...(partial as Record<string, unknown>) };
  for (const f of fields) {
    if (out[f.name] === undefined) out[f.name] = f.default ?? zeroFor(f.type);
  }
  return out as T;
}

export function parsePacket<T>(codec: PacketCodec<T>, body: string): T {
  if (body.startsWith("{")) {
    const obj = JSON.parse(body) as Partial<T> & { $header?: string };
    delete obj.$header;
    return codec.fields ? fillDefaults<T>(codec.fields, obj) : (obj as T);
  }
  const trimmed = body.endsWith("#") ? body.slice(0, -1) : body;
  return codec.decode(trimmed.split("#"));
}

export function encodePacket<T>(
  codec: PacketCodec<T>,
  packet: T,
  asJson: boolean,
): string {
  if (asJson) return JSON.stringify({ $header: codec.header, ...packet });
  if (!codec.encode) {
    throw new Error(`No encoder defined for codec ${codec.header}`);
  }
  return codec.encode(packet);
}

export function readHeader(body: string): string {
  if (body.startsWith("{")) {
    return (JSON.parse(body) as { $header?: string }).$header ?? "";
  }
  const idx = body.indexOf("#");
  return idx === -1 ? body : body.slice(0, idx);
}

/**
 * One registry entry per header. `receive` and `send` are both
 * `(packet: T) => void`, mirroring each other: receive consumes a
 * decoded incoming packet, send encodes-and-transports an outgoing
 * one. Either or both may be present.
 */
/**
 * Registry entry.
 *
 * New pattern (e.g. MC): only `receive` and `send`. `receive(body)` is the
 * inverse of `send(packet)` — it takes wire input (fanta string or parsed
 * JSON object) and runs the whole pipeline. The dispatcher passes the raw
 * body straight through.
 *
 * Legacy pattern: `codec` / `fields` / `schema` describes how to decode the
 * wire into a typed packet, and `receive(packet)` is the typed handler.
 * The dispatcher decodes first, then calls `receive` with the typed packet.
 */
export interface PacketBinding<TPacket> {
  codec?: PacketCodec<TPacket>;
  fields?: readonly Field[];
  schema?: new () => TPacket;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  receive?: (input: any) => void;
  send?: (packet: TPacket) => void;
}

// Each entry pairs the wire codec (decode/encode) with the typed
// receive/send handlers. Registries are indexed by *receiver*:
//
//   clientPacketRegistry -- headers this program receives as a Client
//     (server -> client direction). Each entry exposes `receive`.
//   serverPacketRegistry -- headers this program receives as a Server
//     (client -> server direction). Each entry exposes `send` (the
//     outbound helper produces wire bytes the server would receive) and/or
//     `receive` (used for self-emulation: when we want to act as a server
//     locally to drive replay / self-hosted modes).
//
// Bidirectional headers (CT, HP, MC, MS, RT, ZZ, VS_JOIN, VS_LEAVE,
// VS_SPEAK, ID) appear in *both* registries -- the client-receive form
// in `clientPackets`, the server-receive form in `serverPackets`.
//
// For headers whose wire format differs by direction, the convention is
// two codecs + two packet types per header:
//
//   types:  XXPacketClient (decoded incoming), XXPacketServer (encoded out)
//   codecs: XXClient (in clientPackets), XXServer (in serverPackets)
//
// CT, HP, RT, and ZZ are symmetric enough that a single codec covers
// both directions, so the same codec is referenced from both registries.
// Keep each list alphabetical (case-insensitive).
const clientPackets: Record<string, PacketBinding<any>> = {
  ARUP: { codec: ARUP, receive: receiveARUP },
  BN: { codec: BN, receive: receiveBN },
  CharsCheck: { codec: CharsCheck, receive: receiveCharsCheck },
  CI: { codec: CI, receive: receiveCI },
  CT: { codec: CT, receive: receiveCT },
  EI: { codec: EI, receive: receiveEI },
  EM: { codec: EM, receive: receiveEM },
  FA: { codec: FA, receive: receiveFA },
  FL: { codec: FL, receive: receiveFL },
  FM: { codec: FM, receive: receiveFM },
  HP: { codec: HP, receive: receiveHP },
  ID: { codec: IDClient, receive: receiveID },
  LE: { codec: LE, receive: receiveLE },
  MS: { codec: MSClient, receive: receiveMS },
  PN: { codec: PN, receive: receivePN },
  PU: { codec: PU, receive: receivePU },
  RMC: { codec: RMC, receive: receiveRMC },
  RT: { codec: RT, receive: receiveRT },
  SC: { codec: SC, receive: receiveSC },
  SI: { codec: SI, receive: receiveSI },
  SM: { codec: SM, receive: receiveSM },
  SP: { codec: SP, receive: receiveSP },
  VS_AUDIO: { codec: VS_AUDIO, receive: receiveVS_AUDIO },
  VS_CAPS: { codec: VS_CAPS, receive: receiveVS_CAPS },
  VS_JOIN: { codec: VS_JOINClient, receive: receiveVS_JOIN },
  VS_LEAVE: { codec: VS_LEAVEClient, receive: receiveVS_LEAVE },
  VS_PEERS: { codec: VS_PEERS, receive: receiveVS_PEERS },
  VS_SPEAK: { codec: VS_SPEAKClient, receive: receiveVS_SPEAK },
  ZZ: { codec: ZZ, receive: receiveZZ },
};

export const clientPacketRegistry = new Map(Object.entries(clientPackets));

const serverPackets: Record<string, PacketBinding<any>> = {
  askchaa: { codec: askchaa, receive: receiveaskchaa },
  CH: { codec: CH, receive: receiveCH, send: sendCH },
  CT: { codec: CT, send: sendCT },
  DE: { codec: DE, send: sendDE },
  EE: { codec: EE, send: sendEE },
  HI: { codec: HI, receive: receiveHI },
  HP: { codec: HP, send: sendHP },
  MA: { codec: MA, send: sendMA },
  MS: { codec: MSServer, send: sendMS },
  PE: { codec: PE, send: sendPE },
  RT: { codec: RT, send: sendRT },
  ZZ: { codec: ZZ, send: sendZZ },
};

export const serverPacketRegistry = new Map(Object.entries(serverPackets));

// Packets we can send as a client
export const clientSend = {
  CC: sendCC,
  MC: sendMC,
  RC: sendRC,
  RD: sendRD,
  RM: sendRM,
};

// Packets we can receive as a client
export const clientReceive = {
  ASS: receiveASS,
  AUTH: receiveAUTH,
  BB: receiveBB,
  BD: receiveBD,
  CHECK: receiveCHECK,
  decryptor: receivedecryptor,
  DONE: receiveDONE,
  JD: receiveJD,
  KB: receiveKB,
  KK: receiveKK,
  MC: receiveMC,
  MM: receiveMM,
  PR: receivePR,
  PV: receivePV,
  TI: receiveTI,
};

// Packets we can send as a server
export const serverSend = {
  PV: sendPV,
};

// Packets we can receive as a server
export const serverReceive = {
  CC: receiveCC,
  RC: receiveRC,
  RD: receiveRD,
  RM: receiveRM,
};
