import { PreloadManifest } from "../../cache/types";

// ─── Enums (const enums for zero-cost numeric protocol values) ───

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
export const enum TextColor {
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

/** Runtime render phase tracking */
export enum RenderPhase {
  Shout = "Shout",
  Preanim = "Preanim",
  Speaking = "Speaking",
  Idle = "Idle",
}

// ─── Literal Union Types ─────────────────────────────

/** Standard courtroom positions */
export type Position =
  | "def"
  | "pro"
  | "hld"
  | "hlp"
  | "jud"
  | "wit"
  | "jur"
  | "sea";

/** Positions with dedicated panoramic DOM layers */
export type PanViewPosition = "def" | "pro" | "wit";

/** Text color names matching the existing COLORS constant array */
export const TEXT_COLOR_NAMES = [
  "white",
  "green",
  "red",
  "orange",
  "blue",
  "yellow",
  "pink",
  "cyan",
  "grey",
  "rainbow",
] as const;

export type TextColorName = (typeof TEXT_COLOR_NAMES)[number];

// ─── Sub-interfaces ──────────────────────────────────

/** Parsed character offset from "x&y" wire format. Range: -100 to 100. */
export interface CharacterOffset {
  readonly x: number;
  readonly y: number;
}

/** MS fields 1-3, 8, 12, 19: Main (speaking) character data */
export interface MainCharacterData {
  /** MS field 2: Character folder name */
  readonly folder: string;
  /** MS field 3: Emote sprite name */
  readonly emote: string;
  /** MS field 1: Pre-animation name */
  readonly preanim: string;
  /** MS field 8: Character ID */
  readonly id: number;
  /** MS field 12: Whether sprite is horizontally flipped */
  readonly flip: boolean;
  /** MS field 19: Character position offset, parsed from "x&y" */
  readonly offset: CharacterOffset;
}

/** MS fields 16-18, 20-21: Paired character data. Null when no pairing. */
export interface PairCharacterData {
  /** MS field 16: Paired character ID */
  readonly id: number;
  /** MS field 17: Paired character folder name */
  readonly folder: string;
  /** MS field 18: Paired character emote sprite name */
  readonly emote: string;
  /** MS field 20: Paired character position offset */
  readonly offset: CharacterOffset;
  /** MS field 21: Whether paired sprite is horizontally flipped */
  readonly flip: boolean;
}

/** Parsed from pipe-separated MS field 29 */
export interface EffectData {
  readonly name: string;
  readonly sound: string;
  readonly folder: string;
}

/** MS fields 25-27: Per-frame effect strings */
export interface FrameEffects {
  /** MS field 25: Frame-specific screenshake markers */
  readonly screenshake: string;
  /** MS field 26: Frame-specific realization markers */
  readonly realization: string;
  /** MS field 27: Frame-specific sound effect markers */
  readonly sfx: string;
}

/** Sound-related MS fields */
export interface SoundConfig {
  /** MS field 6: Sound effect name */
  readonly sfx: string;
  /** MS field 9: Sound effect delay in milliseconds */
  readonly sfxDelay: number;
  /** MS field 23: Whether the SFX loops */
  readonly sfxLooping: boolean;
  /** MS field 30: Blip sound override from packet */
  readonly blipsFromPacket: string;
}

/** Text-related MS fields */
export interface TextConfig {
  /** MS field 4: IC message text content */
  readonly content: string;
  /** MS field 14: Text color */
  readonly color: TextColor;
  /** MS field 15: Custom display name */
  readonly showname: string;
  /** MS field 28: Whether text appends to previous message */
  readonly additive: boolean;
}

// ─── Core Types ──────────────────────────────────────

/** Complete decoded MS packet data (all 32 fields, indices 0-31). Immutable after parsing. */
export interface MSPacketData {
  /** MS field 0: Desk visibility modifier */
  readonly deskMod: DeskMod;
  /** MS fields 1-3, 8, 12, 19: Main character data */
  readonly character: MainCharacterData;
  /** MS fields 4, 14, 15, 28: Text configuration */
  readonly text: TextConfig;
  /** MS field 5: Courtroom position. Allows custom/unknown positions from servers. */
  readonly side: Position | string;
  /** MS fields 6, 9, 23, 30: Sound configuration */
  readonly sound: SoundConfig;
  /** MS field 7: Emote playback modifier */
  readonly emoteModifier: EmoteModifier;
  /** MS field 10: Shout (interjection) modifier */
  readonly shoutModifier: ShoutModifier;
  /** Custom shout name, only used when shoutModifier is Custom */
  readonly customShoutName?: string;
  /** MS field 11: Evidence ID to display (0 = none) */
  readonly evidence: number;
  /** MS field 13: Whether realization flash plays */
  readonly realization: boolean;
  /** MS fields 16-18, 20-21: Paired character data, or null when not paired */
  readonly pair: PairCharacterData | null;
  /** MS field 22: Whether to play full preanim without interruption */
  readonly nonInterruptingPreanim: boolean;
  /** MS field 24: Whether screenshake plays */
  readonly screenshake: boolean;
  /** MS fields 25-27: Per-frame effect data */
  readonly frameEffects: FrameEffects;
  /** MS field 29: Effect overlay data, parsed from pipe-separated string */
  readonly effect: EffectData | null;
  /** MS field 31: Slide direction for character entry */
  readonly slide: number;
}

/** Character INI-derived data, resolved from char.ini lookup. Immutable. */
export interface CharacterIniData {
  /** Display name from char.ini [Options] nameplate */
  readonly nameplate: string;
  /** Custom chatbox asset name */
  readonly chatbox: string;
  /** Blip sound name for this character */
  readonly blips: string;
}

/** Mutable renderer working state, updated during render phases. */
export interface RenderRuntimeState {
  /** Parsed HTML spans from IC message text */
  parsed: HTMLSpanElement[];
  /** Resolved asset URLs for preloading */
  preloadManifest: PreloadManifest | null;
  /** Pre-animation duration in milliseconds */
  preanimDuration: number;
  /** Shout animation duration in milliseconds */
  shoutDuration: number;
  /** Text tick speed in milliseconds per character */
  tickSpeed: number;
  /** Resolved blip sound name (from packet override or character INI) */
  resolvedBlips: string;
  /** Whether the character is currently in a talking animation */
  isTalking: boolean;
  /** Whether any animation is currently playing */
  isAnimating: boolean;
  /** Current render phase */
  phase: RenderPhase;
}

/** A single IC message render event. Top-level type combining packet, INI, and runtime data. */
export interface RenderSequence {
  /** Immutable decoded MS packet data */
  readonly packet: MSPacketData;
  /** Immutable character INI-derived data */
  readonly characterIni: CharacterIniData;
  /** Mutable renderer working state */
  runtime: RenderRuntimeState;
}

// ─── Helper Types ────────────────────────────────────

/** Raw MS packet arguments as received from the server */
export type RawMSPacketArgs = readonly string[];

/** Feature flags for MS packet parser, varying by server protocol version */
export interface MSPacketParserConfig {
  readonly supportsPairing: boolean;
  readonly supportsLoopingSfx: boolean;
  readonly supportsFrameEffects: boolean;
  readonly supportsAdditive: boolean;
  readonly supportsEffects: boolean;
  readonly supportsBlips: boolean;
  readonly supportsSlide: boolean;
}

// ─── Constants ───────────────────────────────────────

/** Default values for optional/extended MS packet fields */
export const MS_PACKET_DEFAULTS = {
  deskMod: DeskMod.Shown as DeskMod,
  emoteModifier: EmoteModifier.IdleOnly as EmoteModifier,
  shoutModifier: ShoutModifier.None as ShoutModifier,
  textColor: TextColor.White as TextColor,
  evidence: 0,
  realization: false,
  screenshake: false,
  nonInterruptingPreanim: false,
  additive: false,
  sfxDelay: 0,
  sfxLooping: false,
  slide: 0,
} as const;

/** Starting runtime state for a new render sequence */
export const INITIAL_RUNTIME_STATE: Readonly<RenderRuntimeState> = {
  parsed: [],
  preloadManifest: null,
  preanimDuration: 0,
  shoutDuration: 0,
  tickSpeed: 0,
  resolvedBlips: "",
  isTalking: false,
  isAnimating: false,
  phase: RenderPhase.Shout,
};
