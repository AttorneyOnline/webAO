/**
 * Public typed-packet aliases.
 *
 * Each handler signature (`(packet: aolib.XPacket) => void`) needs a
 * clean name, not the raw `Out<typeof aolib.X>` shape. This file
 * exports one alias per direction the client can see:
 *
 *   - For unidirectional packets (BB, HI, ...): one `XPacket` alias.
 *   - For asymmetric bidirectional packets (MC, MS, CT, VS_*): two
 *     aliases — `XPacket` (the shape we receive on this side, the
 *     dominant case for client-side code) and `XRequestPacket` (the
 *     shape we'd see if we were the server). `XPacket` defaults to
 *     the Broadcast (server -> client) form because the client is the
 *     primary consumer of these types.
 *   - For symmetric bidirectional packets (HP, RT, ZZ): one alias.
 *
 * Aliases derive from `Out<S>` so callers see the typed values after
 * defaults are filled and literals are stripped.
 */

import type { Out } from "./types";
import type {
  // unidirectional
  ARUP, ASS, AUTH, BB, BD, BN, CC, CH, CHECK, CharsCheck, CI,
  DE, DONE, EE, EI, EM, FA, FL, FM, HI, HP, ID, JD,
  KB, KK, LE, MA, PE, PN, PR, PU, PV, RC, RD, RM, RMC, RT,
  SC, SI, SM, SP, TI, VS_AUDIO, VS_CAPS, VS_FRAME, VS_PEERS, ZZ,
  askchaa, decryptor,
  // bidirectional asymmetric
  MCBroadcast, MCRequest,
  MSBroadcast, MSRequest,
  CTBroadcast, CTRequest,
  VSJoinBroadcast, VSJoinRequest,
  VSLeaveBroadcast, VSLeaveRequest,
  VSSpeakBroadcast, VSSpeakRequest,
} from "./packets";

// ---------------------------------------------------------------------
// Unidirectional and symmetric-bidirectional packets — one alias each.
// ---------------------------------------------------------------------

export type ARUPPacket = Out<typeof ARUP>;
export type ASSPacket = Out<typeof ASS>;
export type AUTHPacket = Out<typeof AUTH>;
export type BBPacket = Out<typeof BB>;
export type BDPacket = Out<typeof BD>;
export type BNPacket = Out<typeof BN>;
export type CCPacket = Out<typeof CC>;
export type CHPacket = Out<typeof CH>;
export type CHECKPacket = Out<typeof CHECK>;
export type CharsCheckPacket = Out<typeof CharsCheck>;
export type CIPacket = Out<typeof CI>;
export type DEPacket = Out<typeof DE>;
export type DONEPacket = Out<typeof DONE>;
export type EEPacket = Out<typeof EE>;
export type EIPacket = Out<typeof EI>;
export type EMPacket = Out<typeof EM>;
export type FAPacket = Out<typeof FA>;
export type FLPacket = Out<typeof FL>;
export type FMPacket = Out<typeof FM>;
export type HIPacket = Out<typeof HI>;
export type HPPacket = Out<typeof HP>;
export type IDPacket = Out<typeof ID>;
export type JDPacket = Out<typeof JD>;
export type KBPacket = Out<typeof KB>;
export type KKPacket = Out<typeof KK>;
export type LEPacket = Out<typeof LE>;
export type MAPacket = Out<typeof MA>;
export type PEPacket = Out<typeof PE>;
export type PNPacket = Out<typeof PN>;
export type PRPacket = Out<typeof PR>;
export type PUPacket = Out<typeof PU>;
export type PVPacket = Out<typeof PV>;
export type RCPacket = Out<typeof RC>;
export type RDPacket = Out<typeof RD>;
export type RMPacket = Out<typeof RM>;
export type RMCPacket = Out<typeof RMC>;
export type RTPacket = Out<typeof RT>;
export type SCPacket = Out<typeof SC>;
export type SIPacket = Out<typeof SI>;
export type SMPacket = Out<typeof SM>;
export type SPPacket = Out<typeof SP>;
export type TIPacket = Out<typeof TI>;
export type VS_AUDIOPacket = Out<typeof VS_AUDIO>;
export type VS_CAPSPacket = Out<typeof VS_CAPS>;
export type VS_FRAMEPacket = Out<typeof VS_FRAME>;
export type VS_PEERSPacket = Out<typeof VS_PEERS>;
export type ZZPacket = Out<typeof ZZ>;
export type askchaaPacket = Out<typeof askchaa>;
export type decryptorPacket = Out<typeof decryptor>;

// ---------------------------------------------------------------------
// Bidirectional asymmetric packets — `XPacket` defaults to the
// Broadcast (s2c) shape; the Request (c2s) form has its own alias.
// ---------------------------------------------------------------------

export type MCPacket = Out<typeof MCBroadcast>;
export type MCRequestPacket = Out<typeof MCRequest>;
export type MSPacket = Out<typeof MSBroadcast>;
export type MSRequestPacket = Out<typeof MSRequest>;
export type CTPacket = Out<typeof CTBroadcast>;
export type CTRequestPacket = Out<typeof CTRequest>;
export type VS_JOINPacket = Out<typeof VSJoinBroadcast>;
export type VS_JOINRequestPacket = Out<typeof VSJoinRequest>;
export type VS_LEAVEPacket = Out<typeof VSLeaveBroadcast>;
export type VS_LEAVERequestPacket = Out<typeof VSLeaveRequest>;
export type VS_SPEAKPacket = Out<typeof VSSpeakBroadcast>;
export type VS_SPEAKRequestPacket = Out<typeof VSSpeakRequest>;
