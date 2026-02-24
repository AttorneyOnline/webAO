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

// ─── Protocol Sub-interfaces (MS packet field groupings) ─────────

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

// ─── Core Input Types ────────────────────────────────

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

// ─── Pre-Parsed Text ─────────────────────────────────

/** Color for a text segment: either a named protocol color or an RGB override from AOML */
export type SegmentColor =
  | { readonly kind: "named"; readonly name: TextColorName }
  | { readonly kind: "rgb"; readonly r: number; readonly g: number; readonly b: number };

/** A run of visible text with color and tick speed */
export interface TextRun {
  readonly kind: "text";
  readonly content: string;
  readonly color: SegmentColor;
  readonly tickMs: number;
}

/** An inline effect triggered at a specific point in the text stream */
export interface InlineEffect {
  readonly kind: "screenshake" | "realization";
}

/** A single segment in the pre-parsed text display sequence */
export type TextSegment = TextRun | InlineEffect;

/** Fully pre-parsed IC text display data */
export interface TextDisplay {
  readonly segments: readonly TextSegment[];
  readonly centered: boolean;
  readonly additive: boolean;
}

// ─── Resolved Character Sprites ──────────────────────

/** Main character sprite display data with resolved asset paths */
export interface CharacterDisplay {
  /** Relative path to idle sprite, verified to exist */
  readonly idle: string;
  /** Relative path to talking sprite, or null when blue text / sprite missing */
  readonly talking: string | null;
  readonly flip: boolean;
  readonly offset: CharacterOffset;
}

/** Paired character sprite display data (always idle) */
export interface PairDisplay {
  /** Relative path to idle sprite, verified to exist */
  readonly idle: string;
  readonly flip: boolean;
  readonly offset: CharacterOffset;
}

// ─── Phase Configurations ────────────────────────────

/** Pre-computed shout (interjection) phase configuration */
export interface ShoutPhase {
  /** Relative path to shout image asset */
  readonly image: string;
  /** Relative path to shout sound asset */
  readonly sound: string;
  readonly durationMs: number;
  readonly isCustom: boolean;
}

/** Pre-computed pre-animation phase configuration */
export interface PreanimPhase {
  /** Relative path to preanim sprite */
  readonly sprite: string;
  readonly durationMs: number;
  readonly nonInterrupting: boolean;
}

// ─── Sound & Effects ─────────────────────────────────

/** Resolved sound effect configuration */
export interface SfxConfig {
  /** Relative path to sound file */
  readonly path: string;
  readonly delayMs: number;
  readonly loop: boolean;
}

/** Pre-computed evidence display configuration */
export interface EvidenceDisplay {
  /** Relative path to evidence icon */
  readonly iconPath: string;
  readonly position: "left" | "right";
}

/** Initial (non-frame-specific) effects triggered at render start */
export interface InitialEffects {
  readonly screenshake: boolean;
  readonly realization: boolean;
}

/** Frame effect strings pre-parsed into number arrays */
export interface ParsedFrameEffects {
  readonly screenshakeFrames: readonly number[];
  readonly realizationFrames: readonly number[];
  readonly sfxFrames: readonly number[];
}

/** Overlay effect: rain with intensity or custom image */
export type OverlayEffect =
  | { readonly kind: "rain"; readonly intensity: number }
  | { readonly kind: "image"; readonly path: string };

// ─── Layout ──────────────────────────────────────────

/** Pre-computed position and layout configuration */
export interface PositionLayout {
  readonly side: Position | string;
  /** True for def/pro/wit (panoramic view positions) */
  readonly useFullView: boolean;
  /** True when emoteModifier is Zoom or PreanimZoom */
  readonly showSpeedlines: boolean;
  /** Pre-computed from DeskMod enum */
  readonly deskDuringPreanim: boolean;
  /** Pre-computed from DeskMod enum */
  readonly deskDuringSpeaking: boolean;
  /** True for DeskMod 4/5 (ignore offset) */
  readonly skipOffset: boolean;
}

// ─── Chatbox Display ─────────────────────────────────

/** Pre-computed chatbox display configuration */
export interface ChatboxDisplay {
  /** False for blank posts */
  readonly visible: boolean;
  /** Resolved from showname checkbox + INI nameplate */
  readonly nameplate: string;
  /** Raw showname from packet */
  readonly showname: string;
  /** Relative path to chatbox asset, or null for default theme chatbox */
  readonly chatboxAsset: string | null;
}

// ─── Top-Level Render Plan ───────────────────────────

/**
 * A fully pre-computed, self-contained render plan for a single IC message.
 *
 * All asset resolution, existence checking, text parsing, and layout decisions
 * happen BEFORE this is created. The renderer is a dumb executor that follows
 * this plan mechanically.
 *
 * Pure data. JSON-serializable. No DOM types. All fields readonly.
 */
export interface RenderSequence {
  readonly character: CharacterDisplay;
  readonly pair: PairDisplay | null;
  readonly layout: PositionLayout;
  readonly chatbox: ChatboxDisplay;
  readonly text: TextDisplay;
  readonly shout: ShoutPhase | null;
  readonly preanim: PreanimPhase | null;
  readonly sfx: SfxConfig | null;
  /** Relative path to blip audio file */
  readonly blipSound: string;
  readonly evidence: EvidenceDisplay | null;
  readonly initialEffects: InitialEffects;
  readonly frameEffects: ParsedFrameEffects;
  readonly overlay: OverlayEffect | null;
  readonly slide: number;
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
