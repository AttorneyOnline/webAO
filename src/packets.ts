import { escapeChat, unescapeChat } from "./encoding";
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
import { MCClient, receiveMC, sendMC } from "./packets/MC";
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

/**
 * Field schema. `default` (when present) makes the field optional — it's
 * used when the wire / JSON omits the value. Without `default`, the field
 * is required and `decode` throws if the wire is missing it.
 */
export interface Field {
  name: string;
  type: "string" | "number" | "boolean";
  default?: unknown;
}

const coerce = (raw: string, t: Field["type"]): unknown =>
  t === "string" ? unescapeChat(raw)
  : t === "number" ? Number(raw)
  : raw === "1";

const serialize = (v: unknown, t: Field["type"]): string =>
  t === "string" ? escapeChat(v as string)
  : t === "number" ? String(v)
  : v ? "1" : "0";

/**
 * Decode a wire body (either positional `HEADER#a#b#%` or JSON
 * `{"$header": "HEADER", ...}`) into a typed packet. Missing optional
 * fields get their `default`; missing required fields throw.
 */
export function decode<T>(fields: readonly Field[], body: string): T {
  const out: Record<string, unknown> = {};
  if (body.startsWith("{")) {
    Object.assign(out, JSON.parse(body));
    delete out.$header;
  } else {
    const args = (body.endsWith("#") ? body.slice(0, -1) : body).split("#");
    fields.forEach((f, i) => {
      const v = args[i + 1];
      if (v !== undefined) out[f.name] = coerce(v, f.type);
    });
  }
  for (const f of fields) {
    if (out[f.name] !== undefined) continue;
    if ("default" in f) out[f.name] = f.default;
    else throw new Error(`Missing required field '${f.name}'`);
  }
  return out as T;
}

/**
 * Encode a typed packet to wire bytes. JSON mode emits
 * `{"$header": header, ...packet}`; legacy mode emits positional
 * `HEADER#a#b#%`. Missing fields fall back to `default`; missing required
 * fields throw.
 */
export function encode<T>(
  header: string,
  fields: readonly Field[],
  packet: T,
  asJson: boolean,
): string {
  if (asJson) return JSON.stringify({ $header: header, ...packet });
  const parts = fields.map((f) => {
    let v = (packet as Record<string, unknown>)[f.name];
    if (v === undefined) {
      if (!("default" in f)) {
        throw new Error(`Missing required field '${f.name}' encoding ${header}`);
      }
      v = f.default;
    }
    return serialize(v, f.type);
  });
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

export type FieldType = Field["type"];
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
export interface PacketBinding<TPacket> {
  codec: PacketCodec<TPacket>;
  receive?: (packet: TPacket) => void;
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
  MC: { codec: MCClient, receive: receiveMC, send: sendMC },
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

