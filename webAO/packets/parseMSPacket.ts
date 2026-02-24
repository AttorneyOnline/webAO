import { prepChat, safeTags } from "../encoding";
export type { Position } from "../viewport/positions";

// ─── MS Packet Enums ─────────────────────────────────

/** MS field 0: Desk visibility modifier */
export const enum DeskMod {
  Hidden = 0,
  Shown = 1,
  HiddenDuringPreanim = 2,
  ShownDuringPreanim = 3,
  HiddenIgnoreOffset = 4,
  ShownIgnoreOffset = 5,
}

/** MS field 7: Emote playback modifier */
export const enum EmoteModifier {
  IdleOnly = 0,
  PreanimWithSfx = 1,
  PreanimWithObjection = 2,
  Zoom = 5,
  PreanimZoom = 6,
}

/** MS field 10: Shout (interjection) modifier */
export const enum ShoutModifier {
  None = 0,
  HoldIt = 1,
  Objection = 2,
  TakeThat = 3,
  Custom = 4,
}

/** MS field 14: Text color index. Blue (4) disables talking animation. */
export enum TextColor {
  White = 0,
  Green = 1,
  Red = 2,
  Orange = 3,
  Blue = 4,
  Yellow = 5,
  Pink = 6,
  Cyan = 7,
  Grey = 8,
  Rainbow = 9,
}

export type TextColorName = Lowercase<keyof typeof TextColor>;

/** Look up the CSS color name for a TextColor index. Returns "white" for unknown values. */
export function textColorName(color: TextColor): TextColorName {
  const name = TextColor[color];
  return (name ? name.toLowerCase() : "white") as TextColorName;
}

// ─── Character Data ──────────────────────────────────

/** Parsed character offset from "x<and>y" wire format. Range: -100 to 100. */
export interface CharacterOffset {
  readonly x: number;
  readonly y: number;
}

function parseOffset(raw: string): CharacterOffset {
  const parts = raw.split("<and>");
  return { x: Number(parts[0]) || 0, y: Number(parts[1]) || 0 };
}

// ─── MSPacket Interface ──────────────────────────────

/**
 * Parsed MS (in-character message) packet. All field indices are referenced
 * only in `parseMSPacket` below — the rest of the codebase uses these
 * named, typed fields.
 */
export interface MSPacket {
  readonly deskMod: DeskMod;
  readonly preanim: string;
  readonly charName: string;
  readonly emote: string;
  readonly content: string;
  readonly side: string;
  readonly sfx: string;
  readonly emoteModifier: EmoteModifier;
  readonly charId: number;
  readonly sfxDelay: number;
  readonly shoutModifier: ShoutModifier;
  readonly evidence: number;
  readonly flip: boolean;
  readonly realization: boolean;
  readonly textColor: TextColor;
  readonly showname: string;
  readonly otherCharId: number;
  readonly otherName: string;
  readonly otherEmote: string;
  readonly selfOffset: CharacterOffset;
  readonly otherOffset: CharacterOffset;
  readonly otherFlip: boolean;
  readonly nonInterruptingPreanim: boolean;
  readonly sfxLooping: boolean;
  readonly screenshake: boolean;
  readonly frameScreenshake: string;
  readonly frameRealization: string;
  readonly frameSfx: string;
  readonly additive: boolean;
  readonly effects: readonly string[];
  readonly packetBlips: string;
  readonly slide: number;
}

/**
 * Parse a raw MS packet argument array into a typed MSPacket.
 * This is the **only** place in the codebase that references `args[N]`
 * for MS packet fields.
 */
export function parseMSPacket(args: readonly string[]): MSPacket {
  const base = {
    deskMod: Number(safeTags(args[1]).toLowerCase()) as DeskMod,
    preanim: safeTags(args[2]).toLowerCase(),
    charName: safeTags(args[3]),
    emote: safeTags(args[4]).toLowerCase(),
    content: prepChat(args[5]),
    side: args[6].toLowerCase(),
    sfx: safeTags(args[7]).toLowerCase(),
    emoteModifier: Number(args[8]) as EmoteModifier,
    charId: Number(args[9]),
    sfxDelay: Number(args[10]),
    shoutModifier: Number(args[11]) as ShoutModifier,
    evidence: Number(safeTags(args[12])),
    flip: Number(args[13]) !== 0,
    realization: Number(args[14]) !== 0,
    textColor: Number(args[15]) as TextColor,
  };

  if (args.length <= 16) {
    return {
      ...base,
      showname: "",
      otherCharId: 0,
      otherName: "",
      otherEmote: "",
      selfOffset: { x: 0, y: 0 },
      otherOffset: { x: 0, y: 0 },
      otherFlip: false,
      nonInterruptingPreanim: false,
      sfxLooping: false,
      screenshake: false,
      frameScreenshake: "",
      frameRealization: "",
      frameSfx: "",
      additive: false,
      effects: ["", "", ""],
      packetBlips: "",
      slide: 0,
    };
  }

  const pairing = {
    showname: prepChat(args[16]),
    otherCharId: Number(args[17]),
    otherName: safeTags(args[18]),
    otherEmote: safeTags(args[19]),
    selfOffset: parseOffset(args[20]),
    otherOffset: parseOffset(args[21]),
    otherFlip: Number(args[22]) !== 0,
    nonInterruptingPreanim: Number(args[23]) !== 0,
  };

  if (args.length <= 24) {
    return {
      ...base,
      ...pairing,
      sfxLooping: false,
      screenshake: false,
      frameScreenshake: "",
      frameRealization: "",
      frameSfx: "",
      additive: false,
      effects: ["", "", ""],
      packetBlips: "",
      slide: 0,
    };
  }

  const frameEffects = {
    sfxLooping: Number(args[24]) !== 0,
    screenshake: Number(args[25]) !== 0,
    frameScreenshake: safeTags(args[26]),
    frameRealization: safeTags(args[27]),
    frameSfx: safeTags(args[28]),
  };

  if (args.length <= 29) {
    return {
      ...base,
      ...pairing,
      ...frameEffects,
      additive: false,
      effects: ["", "", ""],
      packetBlips: "",
      slide: 0,
    };
  }

  const additiveAndEffects = {
    additive: Number(args[29]) !== 0,
    effects: args[30].split("|"),
  };

  if (args.length <= 31) {
    return {
      ...base,
      ...pairing,
      ...frameEffects,
      ...additiveAndEffects,
      packetBlips: "",
      slide: 0,
    };
  }

  return {
    ...base,
    ...pairing,
    ...frameEffects,
    ...additiveAndEffects,
    packetBlips: safeTags(args[31]),
    slide: Number(args[32] ?? 0),
  };
}
