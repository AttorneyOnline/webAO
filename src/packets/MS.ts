import { client } from "../client";
import { handleCharacterInfo, ensureCharIni } from "../client/handleCharacterInfo";
import { resetICParams } from "../client/resetICParams";
import { escapeChat, safeTags, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";
import { handle_ic_speaking } from "../viewport/utils/handleICSpeaking";

/**
 * In-character chat message. Field names mirror the spec verbatim
 * (snake_case, see `MS Packet Reference.md`).
 *
 * The wire format has two variants depending on the receiver, plus
 * historical all-or-nothing groups (cccc / 2.7 / 2.8 / 2.10.2). The codec
 * papers over the groups by always producing a fully-populated packet;
 * short wire forms get filled with the documented defaults.
 *
 *   Client-as-receiver (Server → Client): all 32 fields. Modeled by
 *     `MSPacketClient` + the `MS` codec (used by the dispatcher).
 *
 *   Server-as-receiver (Client → Server): same fields *except*
 *     `other_name` and `other_emote` are not present on the wire.
 *     Modeled by `MSPacketServer` + the `MSServer` codec.
 *
 * `self_offset` / `other_offset` are intentionally kept as raw strings:
 * AO2-Client serializes them with `<and>` instead of `&` (a historical
 * wart every server adopted), and the handler splits on `<and>` directly.
 */
/** Desk visibility behavior. See spec for behavioral details per value. */
export enum DeskModifier {
  HIDDEN = 0,
  SHOWN = 1,
  HIDE_DURING_PREANIM = 2,
  SHOW_DURING_PREANIM = 3,
  HIDE_AND_CENTER_DURING_PREANIM = 4,
  SHOW_DURING_PREANIM_THEN_CENTER = 5,
}

/**
 * The wire value `"chat"` (position-dependent default) isn't modeled in
 * the enum -- it's a hack we don't honor today. Unknown wire values
 * (including `"chat"`) fall back to `SHOWN`, matching the previous
 * handler's default switch branch.
 */
const parseDeskModifier = (s: string | undefined): DeskModifier => {
  const n = Number(s);
  if (Number.isInteger(n) && n >= 0 && n <= 5) return n as DeskModifier;
  return DeskModifier.SHOWN;
};

/**
 * Emote behavior selector. Spec values 3 and 4 are documented as
 * unused; any non-recognized wire value falls back to `NO_PREANIM`.
 */
export enum EmoteModifier {
  NO_PREANIM = 0,
  PREANIM = 1,
  PREANIM_AND_OBJECTION = 2,
  ZOOM = 5,
  OBJECTION_ZOOM = 6,
}

export const parseEmoteModifier = (s: string | undefined): EmoteModifier => {
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

/**
 * Shout selector. The spec also defines a `4&{name}` form for naming the
 * custom shout (since 2.8); the codec strips that suffix and just exposes
 * `CUSTOM`. The named-custom-shout feature isn't wired through anywhere
 * downstream today.
 */
export enum ShoutModifier {
  NONE = 0,
  HOLD_IT = 1,
  OBJECTION = 2,
  TAKE_THAT = 3,
  CUSTOM = 4,
}

export const parseShoutModifier = (s: string | undefined): ShoutModifier => {
  // strip optional `&{name}` suffix on the custom-shout form
  const prefix = (s ?? "").split("&")[0];
  const n = Number(prefix);
  if (Number.isInteger(n) && n >= 0 && n <= 4) return n as ShoutModifier;
  return ShoutModifier.NONE;
};

/**
 * Sprite mirroring. Spec defines only NONE/HORIZONTAL; VERTICAL and
 * HORIZONTAL_AND_VERTICAL are non-spec extensions and only fire when a
 * server explicitly sends 2 or 3.
 */
export enum Flip {
  NONE = 0,
  HORIZONTAL = 1,
  VERTICAL = 2,
  HORIZONTAL_AND_VERTICAL = 3,
}

export const parseFlip = (s: string | undefined): Flip => {
  const n = Number(s);
  if (Number.isInteger(n) && n >= 0 && n <= 3) return n as Flip;
  return Flip.NONE;
};

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

export const parseTextColor = (s: string | undefined): TextColor => {
  const n = Number(s);
  if (Number.isInteger(n) && n >= 0 && n <= 9) return n as TextColor;
  return TextColor.WHITE;
};

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

const KNOWN_SIDES = new Set<string>(Object.values(Side));
/** Wire string → `Side`. Unknown values fall back to `WITNESS`. */
export const parseSide = (s: string | undefined): Side => {
  const lower = (s ?? "").toLowerCase();
  return KNOWN_SIDES.has(lower) ? (lower as Side) : Side.WITNESS;
};

export interface MSPacketClient {
  desk_modifier: DeskModifier;
  preanim: string;
  character: string;
  emote: string;
  message: string;
  side: Side;
  sfx_name: string;
  emote_modifier: EmoteModifier;
  char_id: number;
  sfx_delay: number;
  shout_modifier: ShoutModifier;
  evidence_id: number;
  flip: Flip;
  realization: boolean;
  text_color: TextColor;
  // cccc group
  showname: string;
  other_charid: number;
  other_name: string;
  other_emote: string;
  self_offset: string;
  other_offset: string;
  other_flip: Flip;
  noninterrupting_preanim: number;
  // 2.7 group
  sfx_looping: number;
  screenshake: number;
  frames_shake: string;
  frames_realization: string;
  frames_sfx: string;
  // 2.8 group
  additive: number;
  effect: string;
  // 2.10.2 group
  blips: string;
  slide: number;
}

/** Server-as-receiver form: omits `other_name` and `other_emote`. */
export type MSPacketServer = Omit<MSPacketClient, "other_name" | "other_emote">;

const str = (v: string | undefined) => unescapeChat(v ?? "");
const num = (v: string | undefined) => Number(v) || 0;

export const MS: PacketCodec<MSPacketClient> = {
  decode(args) {
    return {
      desk_modifier: parseDeskModifier(args[1]),
      preanim: str(args[2]),
      character: str(args[3]),
      emote: str(args[4]),
      message: str(args[5]),
      side: parseSide(args[6]),
      sfx_name: str(args[7]),
      emote_modifier: parseEmoteModifier(args[8]),
      char_id: num(args[9]),
      sfx_delay: num(args[10]),
      shout_modifier: parseShoutModifier(args[11]),
      evidence_id: num(args[12]),
      flip: parseFlip(args[13]),
      realization: args[14] === "1",
      text_color: parseTextColor(args[15]),
      showname: str(args[16]),
      other_charid: num(args[17]),
      other_name: str(args[18]),
      other_emote: str(args[19]),
      self_offset: args[20] ?? "",
      other_offset: args[21] ?? "",
      other_flip: parseFlip(args[22]),
      noninterrupting_preanim: num(args[23]),
      sfx_looping: num(args[24]),
      screenshake: num(args[25]),
      frames_shake: str(args[26]),
      frames_realization: str(args[27]),
      frames_sfx: str(args[28]),
      additive: num(args[29]),
      effect: str(args[30]),
      blips: str(args[31]),
      slide: num(args[32]),
    };
  },
  encode(p) {
    const fields = [
      "MS",
      String(p.desk_modifier),
      escapeChat(p.preanim),
      escapeChat(p.character),
      escapeChat(p.emote),
      escapeChat(p.message),
      escapeChat(p.side),
      escapeChat(p.sfx_name),
      p.emote_modifier,
      p.char_id,
      p.sfx_delay,
      p.shout_modifier,
      p.evidence_id,
      p.flip,
      Number(p.realization),
      p.text_color,
      escapeChat(p.showname),
      p.other_charid,
      escapeChat(p.other_name),
      escapeChat(p.other_emote),
      p.self_offset,
      p.other_offset,
      p.other_flip,
      p.noninterrupting_preanim,
      p.sfx_looping,
      p.screenshake,
      escapeChat(p.frames_shake),
      escapeChat(p.frames_realization),
      escapeChat(p.frames_sfx),
      p.additive,
      escapeChat(p.effect),
      escapeChat(p.blips),
      p.slide,
    ];
    return `${fields.join("#")}#%`;
  },
};

export const MSServer: PacketCodec<MSPacketServer> = {
  decode(args) {
    return {
      desk_modifier: parseDeskModifier(args[1]),
      preanim: str(args[2]),
      character: str(args[3]),
      emote: str(args[4]),
      message: str(args[5]),
      side: parseSide(args[6]),
      sfx_name: str(args[7]),
      emote_modifier: parseEmoteModifier(args[8]),
      char_id: num(args[9]),
      sfx_delay: num(args[10]),
      shout_modifier: parseShoutModifier(args[11]),
      evidence_id: num(args[12]),
      flip: parseFlip(args[13]),
      realization: args[14] === "1",
      text_color: parseTextColor(args[15]),
      showname: str(args[16]),
      other_charid: num(args[17]),
      // Server-receiver form skips other_name (18) and other_emote (19).
      self_offset: args[18] ?? "",
      other_offset: args[19] ?? "",
      other_flip: parseFlip(args[20]),
      noninterrupting_preanim: num(args[21]),
      sfx_looping: num(args[22]),
      screenshake: num(args[23]),
      frames_shake: str(args[24]),
      frames_realization: str(args[25]),
      frames_sfx: str(args[26]),
      additive: num(args[27]),
      effect: str(args[28]),
      blips: str(args[29]),
      slide: num(args[30]),
    };
  },
  encode(p) {
    const fields = [
      "MS",
      String(p.desk_modifier),
      escapeChat(p.preanim),
      escapeChat(p.character),
      escapeChat(p.emote),
      escapeChat(p.message),
      escapeChat(p.side),
      escapeChat(p.sfx_name),
      p.emote_modifier,
      p.char_id,
      p.sfx_delay,
      p.shout_modifier,
      p.evidence_id,
      p.flip,
      Number(p.realization),
      p.text_color,
      escapeChat(p.showname),
      p.other_charid,
      p.self_offset,
      p.other_offset,
      p.other_flip,
      p.noninterrupting_preanim,
      p.sfx_looping,
      p.screenshake,
      escapeChat(p.frames_shake),
      escapeChat(p.frames_realization),
      escapeChat(p.frames_sfx),
      p.additive,
      escapeChat(p.effect),
      escapeChat(p.blips),
      p.slide,
    ];
    return `${fields.join("#")}#%`;
  },
};

/**
 * Handles an in-character chat message. Gatekeeps (duplicate / iniedit /
 * muted) and then delegates rendering to `handle_ic_speaking`, which owns
 * the viewport state construction from the packet.
 */
export const handleMS = (packet: MSPacketClient) => {
  // duplicate message
  if (packet.message === client.viewport.getChatmsg().content) return;

  const char_id = packet.char_id;
  const char_name = safeTags(packet.character);

  if (char_id < client.char_list_length && char_id >= 0) {
    if (client.chars[char_id].name !== char_name) {
      console.info(
        `${client.chars[char_id].name} is iniediting to ${char_name}`,
      );
      const chargs = (`${char_name}&` + "iniediter").split("&");
      handleCharacterInfo(chargs, char_id);
    } else if (!client.chars[char_id].inifile) {
      // Lazily load char.ini in background so future messages have proper data
      ensureCharIni(char_id);
    }
  }

  const char = client.chars[char_id];
  if (!char) {
    console.error("we're still missing some character data");
  }
  if (char?.muted) return;

  // our own message appeared, reset the buttons
  if (char_id === client.charID) {
    resetICParams();
  }

  handle_ic_speaking(packet); // no await
};
