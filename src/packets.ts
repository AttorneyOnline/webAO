import { decodeChat, escapeChat, unescapeChat } from "./encoding";
import { ARUP, receiveARUP } from "./packets/ARUP";
import { askchaa, receiveaskchaa } from "./packets/askchaa";
import { ASS, receiveASS } from "./packets/ASS";
import { AUTH, receiveAUTH } from "./packets/AUTH";
import { BB, receiveBB } from "./packets/BB";
import { BD, receiveBD } from "./packets/BD";
import { BN, receiveBN } from "./packets/BN";
import { CC, receiveCC, sendCC } from "./packets/CC";
import { CH, receiveCH, sendCH } from "./packets/CH";
import { CharsCheck, receiveCharsCheck } from "./packets/CharsCheck";
import { CHECK, receiveCHECK } from "./packets/CHECK";
import { CI, receiveCI } from "./packets/CI";
import { CT, receiveCT, sendCT } from "./packets/CT";
import { DE, sendDE } from "./packets/DE";
import { decryptor, receivedecryptor } from "./packets/decryptor";
import { DONE, receiveDONE } from "./packets/DONE";
import { EE, sendEE } from "./packets/EE";
import { EI, receiveEI } from "./packets/EI";
import { EM, receiveEM } from "./packets/EM";
import { FA, receiveFA } from "./packets/FA";
import { FL, receiveFL } from "./packets/FL";
import { FM, receiveFM } from "./packets/FM";
import { HI, receiveHI } from "./packets/HI";
import { HP, receiveHP, sendHP } from "./packets/HP";
import { IDClient, receiveID } from "./packets/ID";
import { JD, receiveJD } from "./packets/JD";
import { KB, receiveKB } from "./packets/KB";
import { KK, receiveKK } from "./packets/KK";
import { LE, receiveLE } from "./packets/LE";
import { MA, sendMA } from "./packets/MA";
import { receiveMC, sendMC } from "./packets/MC";
import { MM, receiveMM } from "./packets/MM";
import { MSClient, receiveMS, sendMS } from "./packets/MS";
import { PE, sendPE } from "./packets/PE";
import { PN, receivePN } from "./packets/PN";
import { PR, receivePR } from "./packets/PR";
import { PU, receivePU } from "./packets/PU";
import { PV, receivePV } from "./packets/PV";
import { RC, receiveRC } from "./packets/RC";
import { RD, receiveRD } from "./packets/RD";
import { RM, receiveRM } from "./packets/RM";
import { RMC, receiveRMC } from "./packets/RMC";
import { RT, receiveRT, sendRT } from "./packets/RT";
import { SC, receiveSC } from "./packets/SC";
import { SI, receiveSI } from "./packets/SI";
import { SM, receiveSM } from "./packets/SM";
import { SP, receiveSP } from "./packets/SP";
import { TI, receiveTI } from "./packets/TI";
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

const coerce = (raw: string, t: FieldType): unknown =>
  t === "string" ? decodeChat(unescapeChat(raw))
  : t === "number" ? Number(raw)
  : raw === "1";

const serialize = (v: unknown, t: FieldType): string =>
  t === "string" ? escapeChat(v as string)
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

/** Schema reference: either a `Field[]` array or a class constructor. */
export type Schema<T> = readonly Field[] | (new () => T);

/**
 * Walk a schema (`Field[]` or class) and yield `(name, type, default?)`
 * triplets in wire order. For classes we instantiate once to read the
 * declared defaults / required markers.
 */
function* walkSchema<T>(
  schema: Schema<T>,
): Generator<{ name: string; type: FieldType; default?: unknown; required: boolean }> {
  if (Array.isArray(schema)) {
    for (const f of schema as readonly Field[]) {
      const required = !("default" in f);
      yield { name: f.name, type: f.type, default: f.default, required };
    }
    return;
  }
  const exemplar = new (schema as new () => T)();
  for (const [name, val] of Object.entries(exemplar as object)) {
    if (isReq(val)) {
      yield { name, type: val[REQ], required: true };
    } else {
      const type = typeof val as FieldType;
      yield { name, type, default: val, required: false };
    }
  }
}

/**
 * The "type gauntlet" — shared by `encode` and `decode`. Builds a
 * fully-populated packet from a partial object: for class schemas,
 * instantiating runs the field initializers (defaults + `req()`
 * sentinels), then we overlay the partial values and throw if any
 * required field is still a sentinel. For `Field[]` schemas (legacy),
 * walks the array and fills defaults / throws on missing required.
 */
function cast<T>(schema: Schema<T>, partial: Record<string, unknown>): T {
  if (typeof schema === "function") {
    const instance = new (schema as new () => T)() as Record<string, unknown>;
    Object.assign(instance, partial);
    for (const [name, val] of Object.entries(instance)) {
      if (isReq(val)) throw new Error(`Missing required field '${name}'`);
    }
    return instance as T;
  }
  for (const f of walkSchema<T>(schema)) {
    if (partial[f.name] !== undefined) continue;
    if (!f.required) partial[f.name] = f.default;
    else throw new Error(`Missing required field '${f.name}'`);
  }
  return partial as T;
}

/**
 * Parse a wire body into a typed packet. Auto-detects format: bodies that
 * start with `{` are JSON envelopes (`{"$header":"HEADER",...}`); anything
 * else is positional `HEADER#a#b#%`. Runs the type gauntlet: missing
 * optional fields get their `default`; missing required fields throw.
 */
export function decode<T>(schema: Schema<T>, body: string): T {
  let partial: Record<string, unknown>;
  if (body.startsWith("{")) {
    partial = JSON.parse(body);
    delete partial.$header;
  } else {
    partial = {};
    const specs = [...walkSchema<T>(schema)];
    const args = (body.endsWith("#") ? body.slice(0, -1) : body).split("#");
    specs.forEach((f, i) => {
      const v = args[i + 1];
      if (v !== undefined) partial[f.name] = coerce(v, f.type);
    });
  }
  return cast<T>(schema, partial);
}

/**
 * Serialize a typed packet to wire bytes. Runs the same type gauntlet as
 * `decode` (defaults filled, required validated), then emits either the
 * JSON envelope `{"$header": header, ...packet}` or positional
 * `HEADER#a#b#%`.
 */
export function encode<T>(
  header: string,
  schema: Schema<T>,
  packet: Partial<T>,
  asJson: boolean,
): string {
  const full = cast<T>(schema, packet as Record<string, unknown>) as Record<string, unknown>;
  if (asJson) return JSON.stringify({ $header: header, ...full });
  const parts = [...walkSchema<T>(schema)].map((f) => serialize(full[f.name], f.type));
  return `${header}#${parts.join("#")}#%`;
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
        if (f.type === "string") out[f.name] = unescapeChat(v);
        else if (f.type === "number") out[f.name] = Number(v);
        else out[f.name] = v === "1";
      });
      return out as T;
    },
    encode(packet) {
      const parts: string[] = fields.map((f) => {
        let v = (packet as Record<string, unknown>)[f.name];
        if (v === undefined) v = f.default ?? zeroFor(f.type);
        if (f.type === "string") return escapeChat(v as string);
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
// receive/send handlers. Keep this list alphabetical (case-insensitive).
//
// For packets whose wire format differs by direction (Server-as-
// receiver form vs Client-as-receiver form), the convention is two
// codecs + two packet types per header:
//
//   types:  XXPacketClient (decoded incoming), XXPacketServer (encoded out)
//   codecs: XXClient (used by the dispatcher), XXServer (used by senders)
//
// Only the Client codec appears in this registry -- it's the one that
// reads incoming wire bytes. The Server codec is used by the matching
// sendXX in the same file (see `sendMS` in packets/MS.ts for an example).
// MS is currently the only such packet; CT and ZZ technically have
// direction-conditional wire forms too, but they're symmetric enough
// that a single codec covers both.
const packets: Record<string, PacketBinding<any>> = {
  ARUP: { codec: ARUP, receive: receiveARUP },
  askchaa: { codec: askchaa, receive: receiveaskchaa },
  ASS: { codec: ASS, receive: receiveASS },
  AUTH: { codec: AUTH, receive: receiveAUTH },
  BB: { codec: BB, receive: receiveBB },
  BD: { codec: BD, receive: receiveBD },
  BN: { codec: BN, receive: receiveBN },
  CC: { codec: CC, receive: receiveCC, send: sendCC },
  CH: { codec: CH, receive: receiveCH, send: sendCH },
  CharsCheck: { codec: CharsCheck, receive: receiveCharsCheck },
  CHECK: { codec: CHECK, receive: receiveCHECK },
  CI: { codec: CI, receive: receiveCI },
  CT: { codec: CT, receive: receiveCT, send: sendCT },
  DE: { codec: DE, send: sendDE },
  decryptor: { codec: decryptor, receive: receivedecryptor },
  DONE: { codec: DONE, receive: receiveDONE },
  EE: { codec: EE, send: sendEE },
  EI: { codec: EI, receive: receiveEI },
  EM: { codec: EM, receive: receiveEM },
  FA: { codec: FA, receive: receiveFA },
  FL: { codec: FL, receive: receiveFL },
  FM: { codec: FM, receive: receiveFM },
  HI: { codec: HI, receive: receiveHI },
  HP: { codec: HP, receive: receiveHP, send: sendHP },
  ID: { codec: IDClient, receive: receiveID },
  JD: { codec: JD, receive: receiveJD },
  KB: { codec: KB, receive: receiveKB },
  KK: { codec: KK, receive: receiveKK },
  LE: { codec: LE, receive: receiveLE },
  MA: { codec: MA, send: sendMA },
  MC: { receive: receiveMC, send: sendMC },
  MM: { codec: MM, receive: receiveMM },
  MS: { codec: MSClient, receive: receiveMS, send: sendMS },
  PE: { codec: PE, send: sendPE },
  PN: { codec: PN, receive: receivePN },
  PR: { codec: PR, receive: receivePR },
  PU: { codec: PU, receive: receivePU },
  PV: { codec: PV, receive: receivePV },
  RC: { codec: RC, receive: receiveRC },
  RD: { codec: RD, receive: receiveRD },
  RM: { codec: RM, receive: receiveRM },
  RMC: { codec: RMC, receive: receiveRMC },
  RT: { codec: RT, receive: receiveRT, send: sendRT },
  SC: { codec: SC, receive: receiveSC },
  SI: { codec: SI, receive: receiveSI },
  SM: { codec: SM, receive: receiveSM },
  SP: { codec: SP, receive: receiveSP },
  TI: { codec: TI, receive: receiveTI },
  VS_AUDIO: { codec: VS_AUDIO, receive: receiveVS_AUDIO },
  VS_CAPS: { codec: VS_CAPS, receive: receiveVS_CAPS },
  VS_JOIN: { codec: VS_JOINClient, receive: receiveVS_JOIN },
  VS_LEAVE: { codec: VS_LEAVEClient, receive: receiveVS_LEAVE },
  VS_PEERS: { codec: VS_PEERS, receive: receiveVS_PEERS },
  VS_SPEAK: { codec: VS_SPEAKClient, receive: receiveVS_SPEAK },
  ZZ: { codec: ZZ, receive: receiveZZ, send: sendZZ },
};

export const packetRegistry = new Map(Object.entries(packets));

