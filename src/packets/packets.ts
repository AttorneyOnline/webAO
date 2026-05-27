import { handleMS } from "./handlers/handleMS";
import { handleCT } from "./handlers/handleCT";
import { handleMC } from "./handlers/handleMC";
import { handleRMC } from "./handlers/handleRMC";
import { handleFL } from "./handlers/handleFL";
import { handleLE } from "./handlers/handleLE";
import { handleEM } from "./handlers/handleEM";
import { handleEI } from "./handlers/handleEI";
import { handleSC } from "./handlers/handleSC";
import { handleCI } from "./handlers/handleCI";
import { handleFM } from "./handlers/handleFM";
import { handleFA } from "./handlers/handleFA";
import { handleSM } from "./handlers/handleSM";
import { handleMM } from "./handlers/handleMM";
import { handleBD } from "./handlers/handleBD";
import { handleBB } from "./handlers/handleBB";
import { handleKB } from "./handlers/handleKB";
import { handleKK } from "./handlers/handleKK";
import { handleDONE } from "./handlers/handleDONE";
import { handleBN } from "./handlers/handleBN";
import { handleHP } from "./handlers/handleHP";
import { handleRT } from "./handlers/handleRT";
import { handleTI } from "./handlers/handleTI";
import { handleZZ } from "./handlers/handleZZ";
import { handleHI } from "./handlers/handleHI";
import { handleID } from "./handlers/handleID";
import { handlePN } from "./handlers/handlePN";
import { handleSI } from "./handlers/handleSI";
import { handleARUP } from "./handlers/handleARUP";
import { handleAUTH } from "./handlers/handleAUTH";
import { handleaskchaa } from "./handlers/handleaskchaa";
import { handleCC } from "./handlers/handleCC";
import { handleRC } from "./handlers/handleRC";
import { handleRM } from "./handlers/handleRM";
import { handleRD } from "./handlers/handleRD";
import { handleCharsCheck } from "./handlers/handleCharsCheck";
import { handlePV } from "./handlers/handlePV";
import { handleASS } from "./handlers/handleASS";
import { handleackMS } from "./handlers/handleackMS";
import { handleSP } from "./handlers/handleSP";
import { handleJD } from "./handlers/handleJD";
import { handlePU } from "./handlers/handlePU";
import { handlePR } from "./handlers/handlePR";
import { handleVS_CAPS } from "./handlers/handleVS_CAPS";
import { handleVS_JOIN } from "./handlers/handleVS_JOIN";
import { handleVS_LEAVE } from "./handlers/handleVS_LEAVE";
import { handleVS_PEERS } from "./handlers/handleVS_PEERS";
import { handleVS_SPEAK } from "./handlers/handleVS_SPEAK";
import { handleVS_AUDIO } from "./handlers/handleVS_AUDIO";
import { ZZ } from "./types/ZZ";
import { CT } from "./types/CT";
import { MS } from "./types/MS";
import { MC } from "./types/MC";
import { RMC } from "./types/RMC";
import { CI } from "./types/CI";
import { SC } from "./types/SC";
import { EI } from "./types/EI";
import { FL } from "./types/FL";
import { LE } from "./types/LE";
import { EM } from "./types/EM";
import { FM } from "./types/FM";
import { FA } from "./types/FA";
import { SM } from "./types/SM";
import { MM } from "./types/MM";
import { BD } from "./types/BD";
import { BB } from "./types/BB";
import { KB } from "./types/KB";
import { KK } from "./types/KK";
import { DONE } from "./types/DONE";
import { BN } from "./types/BN";
import { HP } from "./types/HP";
import { RT } from "./types/RT";
import { TI } from "./types/TI";
import { HI } from "./types/HI";
import { ID } from "./types/ID";
import { PN } from "./types/PN";
import { SI } from "./types/SI";
import { ARUP } from "./types/ARUP";
import { AUTH } from "./types/AUTH";
import { askchaa } from "./types/askchaa";
import { CC } from "./types/CC";
import { RC } from "./types/RC";
import { RM } from "./types/RM";
import { RD } from "./types/RD";
import { CharsCheck } from "./types/CharsCheck";
import { PV } from "./types/PV";
import { ASS } from "./types/ASS";
import { ackMS } from "./types/ackMS";
import { SP } from "./types/SP";
import { JD } from "./types/JD";
import { PU } from "./types/PU";
import { PR } from "./types/PR";
import { VS_CAPS } from "./types/VS_CAPS";
import { VS_JOIN } from "./types/VS_JOIN";
import { VS_LEAVE } from "./types/VS_LEAVE";
import { VS_PEERS } from "./types/VS_PEERS";
import { VS_SPEAK } from "./types/VS_SPEAK";
import { VS_AUDIO } from "./types/VS_AUDIO";
import { legacyEntry, PacketEntry } from "./types";

// Each entry pairs the wire codec (decode/encode) with the typed handler.
// Untyped handlers go through `legacyEntry`, which passes the raw arg array
// through unchanged. Migrate one packet at a time off `legacyEntry`.
export const packets: Record<string, PacketEntry<any>> = {
  MS: { codec: MS, handle: handleMS },
  CT: { codec: CT, handle: handleCT },
  MC: { codec: MC, handle: handleMC },
  RMC: { codec: RMC, handle: handleRMC },
  CI: { codec: CI, handle: handleCI },
  SC: { codec: SC, handle: handleSC },
  EI: { codec: EI, handle: handleEI },
  FL: { codec: FL, handle: handleFL },
  LE: { codec: LE, handle: handleLE },
  EM: { codec: EM, handle: handleEM },
  FM: { codec: FM, handle: handleFM },
  FA: { codec: FA, handle: handleFA },
  SM: { codec: SM, handle: handleSM },
  MM: { codec: MM, handle: handleMM },
  BD: { codec: BD, handle: handleBD },
  BB: { codec: BB, handle: handleBB },
  KB: { codec: KB, handle: handleKB },
  KK: { codec: KK, handle: handleKK },
  DONE: { codec: DONE, handle: handleDONE },
  BN: { codec: BN, handle: handleBN },
  HP: { codec: HP, handle: handleHP },
  RT: { codec: RT, handle: handleRT },
  TI: { codec: TI, handle: handleTI },
  ZZ: { codec: ZZ, handle: handleZZ },
  HI: { codec: HI, handle: handleHI },
  ID: { codec: ID, handle: handleID },
  PN: { codec: PN, handle: handlePN },
  SI: { codec: SI, handle: handleSI },
  ARUP: { codec: ARUP, handle: handleARUP },
  AUTH: { codec: AUTH, handle: handleAUTH },
  askchaa: { codec: askchaa, handle: handleaskchaa },
  CC: { codec: CC, handle: handleCC },
  RC: { codec: RC, handle: handleRC },
  RM: { codec: RM, handle: handleRM },
  RD: { codec: RD, handle: handleRD },
  CharsCheck: { codec: CharsCheck, handle: handleCharsCheck },
  PV: { codec: PV, handle: handlePV },
  ASS: { codec: ASS, handle: handleASS },
  ackMS: { codec: ackMS, handle: handleackMS },
  SP: { codec: SP, handle: handleSP },
  JD: { codec: JD, handle: handleJD },
  PU: { codec: PU, handle: handlePU },
  PR: { codec: PR, handle: handlePR },
  VS_CAPS: { codec: VS_CAPS, handle: handleVS_CAPS },
  VS_JOIN: { codec: VS_JOIN, handle: handleVS_JOIN },
  VS_LEAVE: { codec: VS_LEAVE, handle: handleVS_LEAVE },
  VS_PEERS: { codec: VS_PEERS, handle: handleVS_PEERS },
  VS_SPEAK: { codec: VS_SPEAK, handle: handleVS_SPEAK },
  VS_AUDIO: { codec: VS_AUDIO, handle: handleVS_AUDIO },
  decryptor: legacyEntry(() => {}),
  CHECK: legacyEntry(() => {}),
  CH: legacyEntry(() => {}),
};
