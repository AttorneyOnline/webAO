import { client, json_mode } from "./client";
import { unescapeUnicode, escapeFanta, unescapeFanta } from "./escaping";
import { ARUP, receiveARUP } from "./packets/ARUP";
import { askchaa, receiveaskchaa } from "./packets/askchaa";
import { receiveASS } from "./packets/ASS";
import { receiveAUTH } from "./packets/AUTH";
import { receiveBB } from "./packets/BB";
import { receiveBD } from "./packets/BD";
import { BN, receiveBN } from "./packets/BN";
import { CCPacketServer, receiveCC } from "./packets/CC";
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
import { MCPacketServer, receiveMC } from "./packets/MC";
import { receiveMM } from "./packets/MM";
import { MSClient, MSServer, receiveMS, sendMS } from "./packets/MS";
import { PE, sendPE } from "./packets/PE";
import { PN, receivePN } from "./packets/PN";
import { receivePR } from "./packets/PR";
import { PU, receivePU } from "./packets/PU";
import { PVPacket, receivePV } from "./packets/PV";
import { RCPacket, receiveRC } from "./packets/RC";
import { RDPacket, receiveRD } from "./packets/RD";
import { RMPacket, receiveRM } from "./packets/RM";
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

import { Packet } from "./Packet";
export { Packet };

/** A packet schema: a class whose field initializers describe the wire. */
export type Schema<T extends Packet> = new () => T;

/**
 * Decoded packet shape: every field made required, because `cast` fills
 * defaults or throws on missing required. Models the runtime guarantee
 * `decode` provides.
 */
export type Decoded<T> = { [K in keyof T]-?: T[K] };

/**
 * Walk a schema's declared fields in wire order, yielding `(name, type)`
 * pairs. Instantiates the class once to read field initializers (defaults
 * + `req()` sentinels) and reports the declared type for each.
 */
function* walkSchema<T extends Packet>(
  SchemaClass: Schema<T>,
): Generator<{ name: string; type: FieldType }> {
  const exemplar = new SchemaClass();
  for (const [name, val] of Object.entries(exemplar)) {
    const type = isReq(val) ? val[REQ] : (typeof val as FieldType);
    yield { name, type };
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
    if (bag[name] !== undefined) instance[name] = bag[name];
    if (isReq(instance[name])) throw new Error(`Missing required field '${name}'`);
  }
  return instance as T;
}

/**
 * Default args-list emitter for the fanta path: walks the schema and
 * serializes each declared field. Schemas with weird positional layouts
 * (extra literals, `&`-delimited sub-blobs, conditional slots) override
 * `static toArgs` to take over this step; everything else stays library.
 */
export function defaultToArgs<T extends Packet>(
  SchemaClass: Schema<T>,
  packet: T,
): string[] {
  return [...walkSchema<T>(SchemaClass)].map((f) =>
    serialize(packet[f.name], f.type),
  );
}

/**
 * Default args-list parser for the fanta path: maps positional args to
 * declared fields in order, coercing each. Schemas with positional
 * weirdness override `static fromArgs` to take over.
 */
export function defaultFromArgs<T extends Packet>(
  SchemaClass: Schema<T>,
  args: string[],
): Partial<T> {
  const partial: Record<string, unknown> = {};
  let i = 0;
  for (const f of walkSchema<T>(SchemaClass)) {
    const v = args[i];
    if (v !== undefined) partial[f.name] = coerce(v, f.type, f.name);
    i++;
  }
  return partial as Partial<T>;
}

/**
 * Parse a wire body into a typed packet. Auto-detects format: bodies
 * starting with `{` are JSON envelopes; anything else is positional
 * `HEADER#a#b#%`. For fanta, the args list is parsed via the schema's
 * `static fromArgs` if defined, else `defaultFromArgs`. Then `cast`
 * fills defaults and validates required fields.
 */
export function decode<T extends Packet>(schema: Schema<T>, body: string): Decoded<T> {
  let partial: Packet;
  if (body.startsWith("{")) {
    partial = JSON.parse(body);
  } else {
    // Accept `HEADER#a#b#%` (canonical), `HEADER#a#b#`, or `HEADER#a#b`.
    let trimmed = body;
    if (trimmed.endsWith("%")) trimmed = trimmed.slice(0, -1);
    if (trimmed.endsWith("#")) trimmed = trimmed.slice(0, -1);
    const args = trimmed.split("#").slice(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fromArgs = (schema as any).fromArgs as
      | ((a: string[]) => Partial<T>)
      | undefined;
    partial = (fromArgs ? fromArgs(args) : defaultFromArgs(schema, args)) as Packet;
  }
  return cast<T>(schema, partial as Partial<T>) as unknown as Decoded<T>;
}

/**
 * Serialize a typed packet to wire bytes. JSON path emits the
 * `{$header, ...fields}` envelope. Fanta path delegates the args list
 * to the schema's `static toArgs` if defined, else `defaultToArgs`, and
 * the library handles the `HEADER#…#%` framing.
 */
export function encode<T extends Packet>(
  SchemaClass: Schema<T> & { $header: string },
  packet: T,
  asJson: boolean = false,
): string {
  const full = cast<T>(SchemaClass, packet);
  if (asJson) {
    return JSON.stringify({ $header: SchemaClass.$header, ...full });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toArgs = (SchemaClass as any).toArgs as ((p: T) => string[]) | undefined;
  const args = toArgs ? toArgs(full) : defaultToArgs(SchemaClass, full);
  // Zero-field packets are spec'd as `HEADER#%`, not `HEADER##%`.
  if (args.length === 0) return `${SchemaClass.$header}#%`;
  return `${SchemaClass.$header}#${args.join("#")}#%`;
}

/**
 * Build a client-side sender for a packet schema. The returned
 * function encodes against the schema and ships the wire via
 * `client.sendData`. Its parameter type is `T` — inferred from the
 * schema, so call sites get autocomplete with the true required/optional
 * shape of the packet.
 */
export function makeSender<T extends Packet>(
  SchemaClass: Schema<T> & { $header: string },
) {
  return (packet: T) =>
    client.sendData(encode(SchemaClass, packet, json_mode));
}

/**
 * Mirror of `makeSender` for the server-side sender path. The wire
 * loops back to the client-side receive table via `sendDataAsServer`,
 * which validates the header against `serverSend`.
 */
export function makeServerSender<T extends Packet>(
  SchemaClass: Schema<T> & { $header: string },
) {
  return (packet: T) =>
    client.sendDataAsServer(encode(SchemaClass, packet, json_mode));
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
  CC: makeSender(CCPacketServer),
  MC: makeSender(MCPacketServer),
  RC: makeSender(RCPacket),
  RD: makeSender(RDPacket),
  RM: makeSender(RMPacket),
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
  PV: makeServerSender(PVPacket),
};

// Packets we can receive as a server
export const serverReceive = {
  CC: receiveCC,
  RC: receiveRC,
  RD: receiveRD,
  RM: receiveRM,
};
