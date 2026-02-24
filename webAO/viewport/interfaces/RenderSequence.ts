import type {
  Position,
  TextColorName,
  CharacterOffset,
} from "../../packets/parseMSPacket";
import { textColorName } from "../../packets/parseMSPacket";
export type { CharIni } from "../../client/CharIni";

// Re-export MS packet types used by the render pipeline
export type { Position, TextColorName, CharacterOffset };
export { textColorName };

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
  /** Relative path to blip audio file (moved from top-level RenderSequence) */
  readonly blipSound: string;
}

// ─── Character Timelines ─────────────────────────────

/** A single step in a character's render sequence */
export interface RenderStep {
  /** Resolved relative path to sprite */
  readonly sprite: string;
  /** Alternate sprite shown during text crawl, or null to not animate with text */
  readonly talking: string | null;
  /** How long to show this step, or null for the final step (stays indefinitely) */
  readonly durationMs: number | null;
  /** When true, user input cannot skip past this step */
  readonly nonInterrupting: boolean;
  /** Optional sound effect triggered at step start */
  readonly sfx: SfxConfig | null;
}

/** One character's complete independent rendering timeline */
export interface CharacterTimeline {
  /** Render steps; must be non-empty. Last step has durationMs: null. */
  readonly steps: readonly RenderStep[];
  readonly flip: boolean;
  readonly offset: CharacterOffset;
  readonly frameEffects: ParsedFrameEffects;
}

// ─── Phase Configurations ────────────────────────────

/** Pre-computed panoramic slide transition between courtroom positions */
export interface SlidePhase {
  readonly fromSide: string;
  readonly toSide: string;
  readonly durationMs: number;
  readonly bookendDelayMs: number;
}

/** Pre-computed shout (interjection) phase configuration */
export interface ShoutPhase {
  /** Relative path to shout image asset */
  readonly image: string;
  /** Relative path to shout sound asset */
  readonly sound: string;
  readonly durationMs: number;
  readonly isCustom: boolean;
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
  /** Pre-computed from desk modifier */
  readonly deskDuringPreanim: boolean;
  /** Pre-computed from desk modifier */
  readonly deskDuringSpeaking: boolean;
  /** True for desk modifier 4/5 (ignore offset) */
  readonly skipOffset: boolean;
  /** Background image URL for classic view, or null if not resolved */
  readonly backgroundUrl: string | null;
  /** Resolved desk overlay image URL, or null if position has no desk */
  readonly deskUrl: string | null;
  /** Speed-lines animation URL when showSpeedlines is true */
  readonly speedLinesUrl: string | null;
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
  readonly characters: readonly CharacterTimeline[];
  readonly layout: PositionLayout;
  readonly chatbox: ChatboxDisplay;
  readonly text: TextDisplay;
  readonly shout: ShoutPhase | null;
  readonly slide: SlidePhase | null;
  readonly evidence: EvidenceDisplay | null;
  readonly initialEffects: InitialEffects;
  readonly overlay: OverlayEffect | null;
}
