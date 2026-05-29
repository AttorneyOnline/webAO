/**
 * Public typed-packet aliases.
 *
 * Each handler signature (`(packet: aolib.XPacket) => void`) and each
 * send call site (`aolib.XInput`) needs a clean name, not the raw
 * `Out<typeof aolib.X>` / `In<typeof aolib.X>` shape. This file
 * exports one alias per role per direction the client can see:
 *
 *   - `XPacket` — the decoded shape, defaults filled, literals stripped.
 *     Use in handler signatures: `(packet: aolib.MSPacket) => void`.
 *   - `XInput` — the caller-supplied shape, optionals can be omitted.
 *     Use when typing a packet about to be sent:
 *     `const p: aolib.MSInput = {...}; client.server.send.MS(p);`
 *
 * Direction handling:
 *
 *   - Unidirectional packets get one of each: `XPacket` / `XInput`.
 *   - Symmetric bidirectional packets (HP, RT, ZZ, SP) get one of each
 *     since the shape is the same both ways.
 *   - Asymmetric bidirectional packets (MC, MS, CT, VS_*) default both
 *     aliases to whatever the client sees on that direction:
 *       `XPacket`   = Out<XBroadcast>  (s2c shape — what we receive)
 *       `XInput`    = In<XRequest>     (c2s shape — what we send)
 *     The other-direction forms are also exposed:
 *       `XRequestPacket`   = Out<XRequest>   (server-side decode)
 *       `XBroadcastInput`  = In<XBroadcast>  (server-side send)
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
// Unidirectional and symmetric-bidirectional packets — one Packet/Input
// pair each.
// ---------------------------------------------------------------------

export type ARUPPacket = Out<typeof ARUP>;
export type ARUPInput = In<typeof ARUP>;
export type ASSPacket = Out<typeof ASS>;
export type ASSInput = In<typeof ASS>;
export type AUTHPacket = Out<typeof AUTH>;
export type AUTHInput = In<typeof AUTH>;
export type BBPacket = Out<typeof BB>;
export type BBInput = In<typeof BB>;
export type BDPacket = Out<typeof BD>;
export type BDInput = In<typeof BD>;
export type BNPacket = Out<typeof BN>;
export type BNInput = In<typeof BN>;
export type CCPacket = Out<typeof CC>;
export type CCInput = In<typeof CC>;
export type CHPacket = Out<typeof CH>;
export type CHInput = In<typeof CH>;
export type CHECKPacket = Out<typeof CHECK>;
export type CHECKInput = In<typeof CHECK>;
export type CharsCheckPacket = Out<typeof CharsCheck>;
export type CharsCheckInput = In<typeof CharsCheck>;
export type CIPacket = Out<typeof CI>;
export type CIInput = In<typeof CI>;
export type DEPacket = Out<typeof DE>;
export type DEInput = In<typeof DE>;
export type DONEPacket = Out<typeof DONE>;
export type DONEInput = In<typeof DONE>;
export type EEPacket = Out<typeof EE>;
export type EEInput = In<typeof EE>;
export type EIPacket = Out<typeof EI>;
export type EIInput = In<typeof EI>;
export type EMPacket = Out<typeof EM>;
export type EMInput = In<typeof EM>;
export type FAPacket = Out<typeof FA>;
export type FAInput = In<typeof FA>;
export type FLPacket = Out<typeof FL>;
export type FLInput = In<typeof FL>;
export type FMPacket = Out<typeof FM>;
export type FMInput = In<typeof FM>;
export type HIPacket = Out<typeof HI>;
export type HIInput = In<typeof HI>;
export type HPPacket = Out<typeof HP>;
export type HPInput = In<typeof HP>;
export type IDPacket = Out<typeof ID>;
export type IDInput = In<typeof ID>;
export type JDPacket = Out<typeof JD>;
export type JDInput = In<typeof JD>;
export type KBPacket = Out<typeof KB>;
export type KBInput = In<typeof KB>;
export type KKPacket = Out<typeof KK>;
export type KKInput = In<typeof KK>;
export type LEPacket = Out<typeof LE>;
export type LEInput = In<typeof LE>;
export type MAPacket = Out<typeof MA>;
export type MAInput = In<typeof MA>;
export type PEPacket = Out<typeof PE>;
export type PEInput = In<typeof PE>;
export type PNPacket = Out<typeof PN>;
export type PNInput = In<typeof PN>;
export type PRPacket = Out<typeof PR>;
export type PRInput = In<typeof PR>;
export type PUPacket = Out<typeof PU>;
export type PUInput = In<typeof PU>;
export type PVPacket = Out<typeof PV>;
export type PVInput = In<typeof PV>;
export type RCPacket = Out<typeof RC>;
export type RCInput = In<typeof RC>;
export type RDPacket = Out<typeof RD>;
export type RDInput = In<typeof RD>;
export type RMPacket = Out<typeof RM>;
export type RMInput = In<typeof RM>;
export type RMCPacket = Out<typeof RMC>;
export type RMCInput = In<typeof RMC>;
export type RTPacket = Out<typeof RT>;
export type RTInput = In<typeof RT>;
export type SCPacket = Out<typeof SC>;
export type SCInput = In<typeof SC>;
export type SIPacket = Out<typeof SI>;
export type SIInput = In<typeof SI>;
export type SMPacket = Out<typeof SM>;
export type SMInput = In<typeof SM>;
export type SPPacket = Out<typeof SP>;
export type SPInput = In<typeof SP>;
export type TIPacket = Out<typeof TI>;
export type TIInput = In<typeof TI>;
export type VS_AUDIOPacket = Out<typeof VS_AUDIO>;
export type VS_AUDIOInput = In<typeof VS_AUDIO>;
export type VS_CAPSPacket = Out<typeof VS_CAPS>;
export type VS_CAPSInput = In<typeof VS_CAPS>;
export type VS_FRAMEPacket = Out<typeof VS_FRAME>;
export type VS_FRAMEInput = In<typeof VS_FRAME>;
export type VS_PEERSPacket = Out<typeof VS_PEERS>;
export type VS_PEERSInput = In<typeof VS_PEERS>;
export type ZZPacket = Out<typeof ZZ>;
export type ZZInput = In<typeof ZZ>;
export type askchaaPacket = Out<typeof askchaa>;
export type askchaaInput = In<typeof askchaa>;
export type decryptorPacket = Out<typeof decryptor>;
export type decryptorInput = In<typeof decryptor>;

// ---------------------------------------------------------------------
// Bidirectional asymmetric packets.
//
// `XPacket` / `XInput` default to whatever a client-side caller sees:
//   - receive happens on the Broadcast (s2c) form, so `XPacket = Out<XBroadcast>`
//   - send happens on the Request (c2s) form, so `XInput = In<XRequest>`
//
// The mirror-direction forms (server decoding the c2s shape; server
// emitting the s2c shape) are also available for fully-typed callers.
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
