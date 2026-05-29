/**
 * MS — in-character chat. The largest single packet in the protocol.
 *
 * Bidirectional with asymmetric shapes:
 *   Client → server (MSRequest): 26 fields. Omits paired_name,
 *     paired_emote, paired_offset, paired_flip — the server fills
 *     those from the paired client's state before broadcasting.
 *   Server → client (MSBroadcast): 30 fields. Everything.
 *
 * Field types use the AO enums (Side, DeskModifier, EmoteModifier,
 * ShoutModifier, Flip, TextColor) as the public surface so callers
 * write `side: Side.JUDGE` instead of `side: "jud"`. The wire still
 * carries the canonical underlying value (string for Side, number
 * for the rest); each enum is wrapped in a custom() field that
 * handles the conversion both ways with the legacy fallback defaults.
 *
 * `offset` and `paired_offset` are `{x, y}` numeric pairs. On JSON
 * they're native nested objects; on fanta they pack into one
 * positional slot as `x&y` with the `&` chat-escaped to `<and>` to
 * match the legacy wire — modeled as a custom() field rather than
 * `nested()` since the inner separator needs escape protection.
 *
 * Schema-side leniency: nearly every field defaults to its
 * "do-nothing" value (HIDDEN/SHOWN/NONE/empty-string/0/false) so
 * callers only have to set what they care about. The required
 * fields are the minimum the receiver needs to render a message:
 * `character`, `message`, `side`, `char_id`.
 */

import { packet } from "../schema";
import {
  str, num, bool, opt, custom, type CustomField,
} from "../fields";

// ---------------------------------------------------------------------
// Enums — exposed at the public API so callers index by name.
// ---------------------------------------------------------------------

/** Desk visibility behavior. */
export enum DeskModifier {
  HIDDEN = 0,
  SHOWN = 1,
  HIDE_DURING_PREANIM = 2,
  SHOW_DURING_PREANIM = 3,
  HIDE_AND_CENTER_DURING_PREANIM = 4,
  SHOW_DURING_PREANIM_THEN_CENTER = 5,
}

/** Emote behavior selector. Spec values 3 and 4 are documented as unused. */
export enum EmoteModifier {
  NO_PREANIM = 0,
  PREANIM = 1,
  PREANIM_AND_OBJECTION = 2,
  ZOOM = 5,
  OBJECTION_ZOOM = 6,
}

/**
 * Shout / objection selector. The spec also defines a `4&{name}` wire
 * form for naming a custom shout (since 2.8); the codec strips the
 * suffix and just exposes `CUSTOM`.
 */
export enum ShoutModifier {
  NONE = 0,
  HOLD_IT = 1,
  OBJECTION = 2,
  TAKE_THAT = 3,
  CUSTOM = 4,
}

/**
 * Sprite mirroring. Spec defines only NONE / HORIZONTAL; VERTICAL and
 * HORIZONTAL_AND_VERTICAL are non-spec extensions servers may send.
 */
export enum Flip {
  NONE = 0,
  HORIZONTAL = 1,
  VERTICAL = 2,
  HORIZONTAL_AND_VERTICAL = 3,
}

/** Chat message text color. `BLUE` also disables the talking animation. */
export enum TextColor {
  WHITE = 0,
  GREEN = 1,
  RED = 2,
  ORANGE = 3,
  BLUE = 4,
  YELLOW = 5,
  PINK = 6,
  CYAN = 7,
  GREY = 8,
  RAINBOW = 9,
}

/** Character position. Wire values are the lowercase 3-letter codes. */
export enum Side {
  DEFENSE = "def",
  PROSECUTION = "pro",
  DEFENSE_HELPER = "hld",
  PROSECUTION_HELPER = "hlp",
  WITNESS = "wit",
  JUDGE = "jud",
  JURY = "jur",
  SEANCE = "sea",
}

/** `{x, y}` integer offset pair carried in offset / paired_offset slots. */
export interface Offset {
  x: number;
  y: number;
}

/**
 * Convenience predicate — true for sides whose layout uses the
 * full-view pan-camera. The viewport layer consults this when
 * choosing between single-character and paired-character rendering.
 */
export const isFullView = (s: Side): boolean =>
  s === Side.DEFENSE || s === Side.PROSECUTION || s === Side.WITNESS;

// ---------------------------------------------------------------------
// Enum parsers (with the legacy fallback defaults so a malformed
// wire never throws — it just renders as a sane default).
// ---------------------------------------------------------------------

const parseDeskModifier = (s: string): DeskModifier => {
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n <= 5
    ? (n as DeskModifier)
    : DeskModifier.SHOWN;
};

const parseEmoteModifier = (s: string): EmoteModifier => {
  const n = Number(s);
  switch (n) {
    case 0:
    case 1:
    case 2:
    case 5:
    case 6:
      return n as EmoteModifier;
    default:
      return EmoteModifier.NO_PREANIM;
  }
};

const parseShoutModifier = (s: string): ShoutModifier => {
  // Strip optional `&{name}` (custom-shout naming, since 2.8).
  const prefix = s.split("&")[0];
  const n = Number(prefix);
  return Number.isInteger(n) && n >= 0 && n <= 4
    ? (n as ShoutModifier)
    : ShoutModifier.NONE;
};

const parseFlip = (s: string): Flip => {
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n <= 3 ? (n as Flip) : Flip.NONE;
};

const parseTextColor = (s: string): TextColor => {
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 && n <= 9
    ? (n as TextColor)
    : TextColor.WHITE;
};

const KNOWN_SIDES = new Set<string>(Object.values(Side));
const parseSide = (s: string): Side => {
  const lower = s.toLowerCase();
  return KNOWN_SIDES.has(lower) ? (lower as Side) : Side.WITNESS;
};

// ---------------------------------------------------------------------
// Enum-as-Field builder. Wraps an underlying parser in a custom()
// field so the schema-walker treats it uniformly. JSON form is the
// underlying value (number for the integer enums, string for Side);
// fanta form is `String(value)` — these match exactly for both kinds.
// ---------------------------------------------------------------------

function enumField<T>(parse: (token: string) => T): CustomField<T> {
  return custom<T>({
    fromFanta: (token) => parse(token),
    toFanta: (value) => String(value),
    fromJson: (value) => parse(String(value)),
    toJson: (value) => value,
  });
}

const deskModifier = () => enumField(parseDeskModifier);
const emoteModifier = () => enumField(parseEmoteModifier);
const shoutModifier = () => enumField(parseShoutModifier);
const flipField = () => enumField(parseFlip);
const textColor = () => enumField(parseTextColor);
const side = () => enumField(parseSide);

// ---------------------------------------------------------------------
// Offset codec.
//
// Wire form: a single positional slot `x&y`, with the `&` chat-escaped
// to `<and>` (so the actual bytes are `5<and>3`). The escape keeps the
// `&` from being mistaken for a top-level slot separator on legacy
// peers. Modeled as custom() rather than nested() because the inner
// `&` needs escape protection — nested() uses a raw separator.
//
// JSON form: a native `{x, y}` object. The default identity hook for
// custom JSON is exactly what we want.
// ---------------------------------------------------------------------

const escapeAmp = (s: string): string => s.replaceAll("&", "<and>");
const unescapeAmp = (s: string): string => s.replaceAll("<and>", "&");

const offset = (): CustomField<Offset> =>
  custom<Offset>({
    fromFanta: (token) => {
      const [xs = "0", ys = "0"] = unescapeAmp(token).split("&");
      const x = Number(xs);
      const y = Number(ys);
      return {
        x: Number.isFinite(x) ? x : 0,
        y: Number.isFinite(y) ? y : 0,
      };
    },
    toFanta: (value) => escapeAmp(`${value.x}&${value.y}`),
  });

const DEFAULT_OFFSET: Offset = { x: 0, y: 0 };

// ---------------------------------------------------------------------
// Schemas
//
// Field order is the wire order; the schema walker emits / consumes
// positional slots in declaration order. The two schemas share the
// long "head" prefix and the "tail" of cccc/2.7/2.8 fields; the only
// divergence is in the middle, where the broadcast has the four extra
// paired_* fields the request omits.
// ---------------------------------------------------------------------

const HEAD = {
  desk_modifier: opt(deskModifier(), DeskModifier.SHOWN),
  preanim: opt(str(), ""),
  character: str(),
  emote: opt(str(), ""),
  message: str(),
  side: side(),
  sfx_name: opt(str(), ""),
  emote_modifier: opt(emoteModifier(), EmoteModifier.NO_PREANIM),
  char_id: num(),
  sfx_delay: opt(num(), 0),
  shout_modifier: opt(shoutModifier(), ShoutModifier.NONE),
  evidence_id: opt(num(), 0),
  flip: opt(flipField(), Flip.NONE),
  realization: opt(bool(), false),
  text_color: opt(textColor(), TextColor.WHITE),
  showname: opt(str(), ""),
  paired_charid: opt(num(), -1),
};

const TAIL = {
  noninterrupting_preanim: opt(bool(), false),
  sfx_looping: opt(bool(), false),
  screenshake: opt(bool(), false),
  frames_shake: opt(str(), ""),
  frames_realization: opt(str(), ""),
  frames_sfx: opt(str(), ""),
  additive: opt(bool(), false),
  effect: opt(str(), ""),
};

/** Client → server: 26 fields. Omits paired_name, paired_emote, paired_offset, paired_flip. */
export const MSRequest = packet("MS", {
  ...HEAD,
  offset: opt(offset(), DEFAULT_OFFSET),
  ...TAIL,
});

/** Server → client: 30 fields. Adds paired_name, paired_emote, paired_offset, paired_flip. */
export const MSBroadcast = packet("MS", {
  ...HEAD,
  paired_name: opt(str(), ""),
  paired_emote: opt(str(), ""),
  offset: opt(offset(), DEFAULT_OFFSET),
  paired_offset: opt(offset(), DEFAULT_OFFSET),
  paired_flip: opt(flipField(), Flip.NONE),
  ...TAIL,
});
