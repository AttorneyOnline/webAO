import { ARUP, receiveARUP } from "./packets/ARUP";
import { askchaa, receiveaskchaa } from "./packets/askchaa";
import { ASS, receiveASS } from "./packets/ASS";
import { AUTH, receiveAUTH } from "./packets/AUTH";
import { BB, receiveBB } from "./packets/BB";
import { BD, receiveBD } from "./packets/BD";
import { BN, receiveBN } from "./packets/BN";
import { CC, receiveCC } from "./packets/CC";
import { CH, receiveCH } from "./packets/CH";
import { CharsCheck, receiveCharsCheck } from "./packets/CharsCheck";
import { CHECK, receiveCHECK } from "./packets/CHECK";
import { CI, receiveCI } from "./packets/CI";
import { CT, receiveCT } from "./packets/CT";
import { decryptor, receivedecryptor } from "./packets/decryptor";
import { DONE, receiveDONE } from "./packets/DONE";
import { EI, receiveEI } from "./packets/EI";
import { EM, receiveEM } from "./packets/EM";
import { FA, receiveFA } from "./packets/FA";
import { FL, receiveFL } from "./packets/FL";
import { FM, receiveFM } from "./packets/FM";
import { HI, receiveHI } from "./packets/HI";
import { HP, receiveHP } from "./packets/HP";
import { ID, receiveID } from "./packets/ID";
import { JD, receiveJD } from "./packets/JD";
import { KB, receiveKB } from "./packets/KB";
import { KK, receiveKK } from "./packets/KK";
import { LE, receiveLE } from "./packets/LE";
import { MC, receiveMC } from "./packets/MC";
import { MM, receiveMM } from "./packets/MM";
import { MSClient, receiveMS } from "./packets/MS";
import { PN, receivePN } from "./packets/PN";
import { PR, receivePR } from "./packets/PR";
import { PU, receivePU } from "./packets/PU";
import { PV, receivePV } from "./packets/PV";
import { RC, receiveRC } from "./packets/RC";
import { RD, receiveRD } from "./packets/RD";
import { RM, receiveRM } from "./packets/RM";
import { RMC, receiveRMC } from "./packets/RMC";
import { RT, receiveRT } from "./packets/RT";
import { SC, receiveSC } from "./packets/SC";
import { SI, receiveSI } from "./packets/SI";
import { SM, receiveSM } from "./packets/SM";
import { SP, receiveSP } from "./packets/SP";
import { TI, receiveTI } from "./packets/TI";
import { VS_AUDIO, receiveVS_AUDIO } from "./packets/VS_AUDIO";
import { VS_CAPS, receiveVS_CAPS } from "./packets/VS_CAPS";
import { VS_JOIN, receiveVS_JOIN } from "./packets/VS_JOIN";
import { VS_LEAVE, receiveVS_LEAVE } from "./packets/VS_LEAVE";
import { VS_PEERS, receiveVS_PEERS } from "./packets/VS_PEERS";
import { VS_SPEAK, receiveVS_SPEAK } from "./packets/VS_SPEAK";
import { ZZ, receiveZZ } from "./packets/ZZ";
import { sender } from "./client/sender";

/**
 * A codec for a single packet header. `decode` parses the `#`-split args
 * (with args[0] being the header) into a typed packet. `encode` serializes
 * a typed packet back to the wire format, including the trailing `#%`.
 *
 * `encode` is optional: receive-only packets omit it. The dispatcher only
 * calls `decode`; encoders are called directly by name from the sender
 * modules.
 */
export interface PacketCodec<TPacket> {
  decode(args: string[]): TPacket;
  encode?(packet: TPacket): string;
}

/** One registry entry: codec paired with the receiver that consumes its output. */
export interface PacketEntry<TPacket> {
  codec: PacketCodec<TPacket>;
  receive: (packet: TPacket) => void;
}

// Each entry pairs the wire codec (decode/encode) with the typed receiver.
// Keep this list alphabetical (case-insensitive).
//
// For packets whose wire format differs by direction (i.e. the Server-as-
// receiver form differs from the Client-as-receiver form), the convention
// is two codecs + two packet types per header:
//
//   types:  XXPacketClient (decoded incoming), XXPacketServer (encoded out)
//   codecs: XXClient (used by the dispatcher), XXServer (used by senders)
//
// Only the Client codec appears in this registry -- it's the one that
// reads incoming wire bytes. The Server codec is imported directly by
// whichever `sendXX.ts` builds the outbound packet (see sendIC.ts for an
// example). MS is currently the only such packet; CT and ZZ technically
// have direction-conditional wire forms too, but they're symmetric enough
// that a single codec covers both.
const packets: Record<string, PacketEntry<any>> = {
  ARUP: { codec: ARUP, receive: receiveARUP },
  askchaa: { codec: askchaa, receive: receiveaskchaa },
  ASS: { codec: ASS, receive: receiveASS },
  AUTH: { codec: AUTH, receive: receiveAUTH },
  BB: { codec: BB, receive: receiveBB },
  BD: { codec: BD, receive: receiveBD },
  BN: { codec: BN, receive: receiveBN },
  CC: { codec: CC, receive: receiveCC },
  CH: { codec: CH, receive: receiveCH },
  CharsCheck: { codec: CharsCheck, receive: receiveCharsCheck },
  CHECK: { codec: CHECK, receive: receiveCHECK },
  CI: { codec: CI, receive: receiveCI },
  CT: { codec: CT, receive: receiveCT },
  decryptor: { codec: decryptor, receive: receivedecryptor },
  DONE: { codec: DONE, receive: receiveDONE },
  EI: { codec: EI, receive: receiveEI },
  EM: { codec: EM, receive: receiveEM },
  FA: { codec: FA, receive: receiveFA },
  FL: { codec: FL, receive: receiveFL },
  FM: { codec: FM, receive: receiveFM },
  HI: { codec: HI, receive: receiveHI },
  HP: { codec: HP, receive: receiveHP },
  ID: { codec: ID, receive: receiveID },
  JD: { codec: JD, receive: receiveJD },
  KB: { codec: KB, receive: receiveKB },
  KK: { codec: KK, receive: receiveKK },
  LE: { codec: LE, receive: receiveLE },
  MC: { codec: MC, receive: receiveMC },
  MM: { codec: MM, receive: receiveMM },
  MS: { codec: MSClient, receive: receiveMS },
  PN: { codec: PN, receive: receivePN },
  PR: { codec: PR, receive: receivePR },
  PU: { codec: PU, receive: receivePU },
  PV: { codec: PV, receive: receivePV },
  RC: { codec: RC, receive: receiveRC },
  RD: { codec: RD, receive: receiveRD },
  RM: { codec: RM, receive: receiveRM },
  RMC: { codec: RMC, receive: receiveRMC },
  RT: { codec: RT, receive: receiveRT },
  SC: { codec: SC, receive: receiveSC },
  SI: { codec: SI, receive: receiveSI },
  SM: { codec: SM, receive: receiveSM },
  SP: { codec: SP, receive: receiveSP },
  TI: { codec: TI, receive: receiveTI },
  VS_AUDIO: { codec: VS_AUDIO, receive: receiveVS_AUDIO },
  VS_CAPS: { codec: VS_CAPS, receive: receiveVS_CAPS },
  VS_JOIN: { codec: VS_JOIN, receive: receiveVS_JOIN },
  VS_LEAVE: { codec: VS_LEAVE, receive: receiveVS_LEAVE },
  VS_PEERS: { codec: VS_PEERS, receive: receiveVS_PEERS },
  VS_SPEAK: { codec: VS_SPEAK, receive: receiveVS_SPEAK },
  ZZ: { codec: ZZ, receive: receiveZZ },
};

export const packetRegistry = new Map(Object.entries(packets));

// Sender type lives here so packets.ts is the single home for the public
// packet API (codecs, receive registry, send signatures).
export type Sender = typeof sender;
