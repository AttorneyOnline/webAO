/**
 * Direction-keyed schema registries.
 *
 * `c2sSchemas` — packets a client sends and a server receives.
 * `s2cSchemas` — packets a server sends and a client receives.
 *
 * The same header may exist in both maps (e.g. `MC`, `CT`, `HP`,
 * `RT`, `ZZ`, `VS_JOIN`, `VS_LEAVE`, `VS_SPEAK` are bidirectional);
 * for symmetric packets the same schema constant is registered in
 * both maps, for asymmetric ones each direction picks its own.
 *
 * `const` assertions preserve the literal keys for session.ts's
 * mapped types — `aolib.server(...).send.<key>` is exactly typed.
 *
 * Deferred (not yet ported): `MS` (32-field chat with custom enum
 * parsers and offset packing) and `ARUP` (per-update-type union
 * payload). Both need schema-level toArgs/fromArgs overrides; they
 * land in a follow-up commit.
 */

import { HI } from "./HI";
import { CC } from "./CC";
import { MCRequest, MCBroadcast } from "./MC";
import { MSRequest, MSBroadcast } from "./MS";
import { CTRequest, CTBroadcast } from "./CT";
import { HP } from "./HP";
import { RT } from "./RT";
import { ZZ } from "./ZZ";
import { VSJoinRequest, VSJoinBroadcast } from "./VS_JOIN";
import { VSLeaveRequest, VSLeaveBroadcast } from "./VS_LEAVE";
import { VSSpeakRequest, VSSpeakBroadcast } from "./VS_SPEAK";

import { AE } from "./AE";
import { AM } from "./AM";
import { AN } from "./AN";
import { askchaa } from "./askchaa";
import { CH } from "./CH";
import { DE } from "./DE";
import { EE } from "./EE";
import { MA } from "./MA";
import { PE } from "./PE";
import { RC } from "./RC";
import { RD } from "./RD";
import { RM } from "./RM";
import { VS_FRAME } from "./VS_FRAME";

import { decryptor } from "./decryptor";
import { ID } from "./ID";
import { PV } from "./PV";
import { BB } from "./BB";
import { DONE } from "./DONE";
import { SM } from "./SM";

import { ASS } from "./ASS";
import { AUTH } from "./AUTH";
import { BD } from "./BD";
import { BN } from "./BN";
import { CHECK } from "./CHECK";
import { CharsCheck } from "./CharsCheck";
import { FA } from "./FA";
import { FL } from "./FL";
import { FM } from "./FM";
import { JD } from "./JD";
import { KB } from "./KB";
import { KK } from "./KK";
import { PN } from "./PN";
import { PR } from "./PR";
import { PU } from "./PU";
import { RMC } from "./RMC";
import { SC } from "./SC";
import { SI } from "./SI";
import { SP } from "./SP";
import { TI } from "./TI";
import { VS_AUDIO } from "./VS_AUDIO";
import { VS_CAPS } from "./VS_CAPS";
import { VS_PEERS } from "./VS_PEERS";

import { CI } from "./CI";
import { EM } from "./EM";
import { EI } from "./EI";
import { LE } from "./LE";

export const c2sSchemas = {
  // handshake / lifecycle
  HI,
  askchaa,
  RC,
  RD,
  RM,
  CH,
  // gameplay
  CC,
  CT: CTRequest,
  MC: MCRequest,
  MS: MSRequest,
  HP,
  RT,
  ZZ,
  // evidence
  AE,
  AM,
  AN,
  DE,
  EE,
  PE,
  // moderation
  MA,
  // voice
  VS_FRAME,
  VS_JOIN: VSJoinRequest,
  VS_LEAVE: VSLeaveRequest,
  VS_SPEAK: VSSpeakRequest,
} as const;

export const s2cSchemas = {
  // handshake / lifecycle
  decryptor,
  ID,
  SI,
  DONE,
  CHECK,
  // gameplay
  PV,
  BB,
  CT: CTBroadcast,
  MC: MCBroadcast,
  MS: MSBroadcast,
  HP,
  RT,
  ZZ,
  SP,
  JD,
  TI,
  BN,
  ASS,
  AUTH,
  // lists / batches
  SM,
  FM,
  FA,
  FL,
  SC,
  CharsCheck,
  CI,
  EM,
  EI,
  LE,
  RMC,
  // player roster
  PN,
  PR,
  PU,
  // moderation
  BD,
  KB,
  KK,
  // voice
  VS_AUDIO,
  VS_CAPS,
  VS_PEERS,
  VS_JOIN: VSJoinBroadcast,
  VS_LEAVE: VSLeaveBroadcast,
  VS_SPEAK: VSSpeakBroadcast,
} as const;

export type C2SSchemas = typeof c2sSchemas;
export type S2CSchemas = typeof s2cSchemas;

// ---------------------------------------------------------------------
// Re-export every schema constant for callers who want them by name.
// ---------------------------------------------------------------------

export {
  HI, CC, MCRequest, MCBroadcast, MSRequest, MSBroadcast,
  decryptor, ID, PV, BB, DONE, SM,
  CTRequest, CTBroadcast, HP, RT, ZZ,
  VSJoinRequest, VSJoinBroadcast,
  VSLeaveRequest, VSLeaveBroadcast,
  VSSpeakRequest, VSSpeakBroadcast,
  AE, AM, AN, askchaa, CH, DE, EE, MA, PE, RC, RD, RM, VS_FRAME,
  ASS, AUTH, BD, BN, CHECK, CharsCheck, FA, FL, FM, JD, KB, KK,
  PN, PR, PU, RMC, SC, SI, SP, TI,
  VS_AUDIO, VS_CAPS, VS_PEERS,
  CI, EM, EI, LE,
};

// MS exposes the AO enums (Side, etc.) as the public type surface
// for callers — re-export them by name.
export {
  Side,
  DeskModifier,
  EmoteModifier,
  ShoutModifier,
  Flip,
  TextColor,
  isFullView,
  type Offset,
} from "./MS";
