/**
 * Public typed-packet aliases.
 *
 * Every packet gets an `XPacket` alias for handler signatures
 * (`(packet: aolib.MSPacket) => void` instead of leaking
 * `Out<typeof aolib.X>`).
 *
 * Send call sites don't need typed-variable aliases for most packets
 * because `client.server.send.X({...})` infers the input shape from
 * the schema — no annotation needed. The exception is the six
 * asymmetric bidirectional packets (MC, MS, CT, VS_JOIN, VS_LEAVE,
 * VS_SPEAK), where the send shape and receive shape genuinely differ:
 * for those we expose `XInput` (the c2s shape, what client code sends)
 * and the mirror-direction forms (`XRequestPacket`, `XBroadcastInput`)
 * for server-side users.
 */

import type { In, Out } from "./types";
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
// Asymmetric bidirectional packets.
//
// Client-side defaults (what code in this repo uses):
//   `XPacket` = Out<XBroadcast>   (s2c — what we receive)
//   `XInput`  = In<XRequest>      (c2s — what we send)
//
// Server-side mirror direction (also exposed):
//   `XRequestPacket`  = Out<XRequest>   (server-side decode)
//   `XBroadcastInput` = In<XBroadcast>  (server-side send)
// ---------------------------------------------------------------------

export type MCPacket = Out<typeof MCBroadcast>;
export type MCInput = In<typeof MCRequest>;
export type MCRequestPacket = Out<typeof MCRequest>;
export type MCBroadcastInput = In<typeof MCBroadcast>;

export type MSPacket = Out<typeof MSBroadcast>;
export type MSInput = In<typeof MSRequest>;
export type MSRequestPacket = Out<typeof MSRequest>;
export type MSBroadcastInput = In<typeof MSBroadcast>;

export type CTPacket = Out<typeof CTBroadcast>;
export type CTInput = In<typeof CTRequest>;
export type CTRequestPacket = Out<typeof CTRequest>;
export type CTBroadcastInput = In<typeof CTBroadcast>;

export type VS_JOINPacket = Out<typeof VSJoinBroadcast>;
export type VS_JOINInput = In<typeof VSJoinRequest>;
export type VS_JOINRequestPacket = Out<typeof VSJoinRequest>;
export type VS_JOINBroadcastInput = In<typeof VSJoinBroadcast>;

export type VS_LEAVEPacket = Out<typeof VSLeaveBroadcast>;
export type VS_LEAVEInput = In<typeof VSLeaveRequest>;
export type VS_LEAVERequestPacket = Out<typeof VSLeaveRequest>;
export type VS_LEAVEBroadcastInput = In<typeof VSLeaveBroadcast>;

export type VS_SPEAKPacket = Out<typeof VSSpeakBroadcast>;
export type VS_SPEAKInput = In<typeof VSSpeakRequest>;
export type VS_SPEAKRequestPacket = Out<typeof VSSpeakRequest>;
export type VS_SPEAKBroadcastInput = In<typeof VSSpeakBroadcast>;
