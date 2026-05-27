import { ARUP, handleARUP } from "./packets/ARUP";
import { askchaa, handleaskchaa } from "./packets/askchaa";
import { ASS, handleASS } from "./packets/ASS";
import { AUTH, handleAUTH } from "./packets/AUTH";
import { BB, handleBB } from "./packets/BB";
import { BD, handleBD } from "./packets/BD";
import { BN, handleBN } from "./packets/BN";
import { CC, handleCC } from "./packets/CC";
import { CH, handleCH } from "./packets/CH";
import { CharsCheck, handleCharsCheck } from "./packets/CharsCheck";
import { CHECK, handleCHECK } from "./packets/CHECK";
import { CI, handleCI } from "./packets/CI";
import { CT, handleCT } from "./packets/CT";
import { decryptor, handledecryptor } from "./packets/decryptor";
import { DONE, handleDONE } from "./packets/DONE";
import { EI, handleEI } from "./packets/EI";
import { EM, handleEM } from "./packets/EM";
import { FA, handleFA } from "./packets/FA";
import { FL, handleFL } from "./packets/FL";
import { FM, handleFM } from "./packets/FM";
import { HI, handleHI } from "./packets/HI";
import { HP, handleHP } from "./packets/HP";
import { ID, handleID } from "./packets/ID";
import { JD, handleJD } from "./packets/JD";
import { KB, handleKB } from "./packets/KB";
import { KK, handleKK } from "./packets/KK";
import { LE, handleLE } from "./packets/LE";
import { MC, handleMC } from "./packets/MC";
import { MM, handleMM } from "./packets/MM";
import { MSClient, handleMS } from "./packets/MS";
import { PN, handlePN } from "./packets/PN";
import { PR, handlePR } from "./packets/PR";
import { PU, handlePU } from "./packets/PU";
import { PV, handlePV } from "./packets/PV";
import { RC, handleRC } from "./packets/RC";
import { RD, handleRD } from "./packets/RD";
import { RM, handleRM } from "./packets/RM";
import { RMC, handleRMC } from "./packets/RMC";
import { RT, handleRT } from "./packets/RT";
import { SC, handleSC } from "./packets/SC";
import { SI, handleSI } from "./packets/SI";
import { SM, handleSM } from "./packets/SM";
import { SP, handleSP } from "./packets/SP";
import { TI, handleTI } from "./packets/TI";
import { VS_AUDIO, handleVS_AUDIO } from "./packets/VS_AUDIO";
import { VS_CAPS, handleVS_CAPS } from "./packets/VS_CAPS";
import { VS_JOIN, handleVS_JOIN } from "./packets/VS_JOIN";
import { VS_LEAVE, handleVS_LEAVE } from "./packets/VS_LEAVE";
import { VS_PEERS, handleVS_PEERS } from "./packets/VS_PEERS";
import { VS_SPEAK, handleVS_SPEAK } from "./packets/VS_SPEAK";
import { ZZ, handleZZ } from "./packets/ZZ";

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

/** One registry entry: codec paired with the handler that consumes its output. */
export interface PacketEntry<TPacket> {
  codec: PacketCodec<TPacket>;
  handle: (packet: TPacket) => void;
}

// Each entry pairs the wire codec (decode/encode) with the typed handler.
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
  ARUP: { codec: ARUP, handle: handleARUP },
  askchaa: { codec: askchaa, handle: handleaskchaa },
  ASS: { codec: ASS, handle: handleASS },
  AUTH: { codec: AUTH, handle: handleAUTH },
  BB: { codec: BB, handle: handleBB },
  BD: { codec: BD, handle: handleBD },
  BN: { codec: BN, handle: handleBN },
  CC: { codec: CC, handle: handleCC },
  CH: { codec: CH, handle: handleCH },
  CharsCheck: { codec: CharsCheck, handle: handleCharsCheck },
  CHECK: { codec: CHECK, handle: handleCHECK },
  CI: { codec: CI, handle: handleCI },
  CT: { codec: CT, handle: handleCT },
  decryptor: { codec: decryptor, handle: handledecryptor },
  DONE: { codec: DONE, handle: handleDONE },
  EI: { codec: EI, handle: handleEI },
  EM: { codec: EM, handle: handleEM },
  FA: { codec: FA, handle: handleFA },
  FL: { codec: FL, handle: handleFL },
  FM: { codec: FM, handle: handleFM },
  HI: { codec: HI, handle: handleHI },
  HP: { codec: HP, handle: handleHP },
  ID: { codec: ID, handle: handleID },
  JD: { codec: JD, handle: handleJD },
  KB: { codec: KB, handle: handleKB },
  KK: { codec: KK, handle: handleKK },
  LE: { codec: LE, handle: handleLE },
  MC: { codec: MC, handle: handleMC },
  MM: { codec: MM, handle: handleMM },
  MS: { codec: MSClient, handle: handleMS },
  PN: { codec: PN, handle: handlePN },
  PR: { codec: PR, handle: handlePR },
  PU: { codec: PU, handle: handlePU },
  PV: { codec: PV, handle: handlePV },
  RC: { codec: RC, handle: handleRC },
  RD: { codec: RD, handle: handleRD },
  RM: { codec: RM, handle: handleRM },
  RMC: { codec: RMC, handle: handleRMC },
  RT: { codec: RT, handle: handleRT },
  SC: { codec: SC, handle: handleSC },
  SI: { codec: SI, handle: handleSI },
  SM: { codec: SM, handle: handleSM },
  SP: { codec: SP, handle: handleSP },
  TI: { codec: TI, handle: handleTI },
  VS_AUDIO: { codec: VS_AUDIO, handle: handleVS_AUDIO },
  VS_CAPS: { codec: VS_CAPS, handle: handleVS_CAPS },
  VS_JOIN: { codec: VS_JOIN, handle: handleVS_JOIN },
  VS_LEAVE: { codec: VS_LEAVE, handle: handleVS_LEAVE },
  VS_PEERS: { codec: VS_PEERS, handle: handleVS_PEERS },
  VS_SPEAK: { codec: VS_SPEAK, handle: handleVS_SPEAK },
  ZZ: { codec: ZZ, handle: handleZZ },
};

export const packetHandler = new Map(Object.entries(packets));
