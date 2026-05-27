import { client, UPDATE_INTERVAL } from "../client";
import { handleCharacterInfo, ensureCharIni } from "../client/handleCharacterInfo";
import { resetICParams } from "../client/resetICParams";
import { decodeChat, escapeChat, safeTags, unescapeChat } from "../encoding";
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
 *     `MSPacket` + the `MS` codec (used by the dispatcher).
 *
 *   Server-as-receiver (Client → Server): same fields *except*
 *     `other_name` and `other_emote` are not present on the wire.
 *     Modeled by `MSPacketServer` + the `MSServer` codec.
 *
 * `self_offset` / `other_offset` are intentionally kept as raw strings:
 * AO2-Client serializes them with `<and>` instead of `&` (a historical
 * wart every server adopted), and the handler splits on `<and>` directly.
 */
export interface MSPacket {
  desk_mod: string;
  preanim: string;
  character: string;
  emote: string;
  message: string;
  side: string;
  sfx_name: string;
  emote_modifier: number;
  char_id: number;
  sfx_delay: number;
  shout_modifier: number;
  evidence: string;
  flip: number;
  realization: number;
  text_color: number;
  // cccc group
  showname: string;
  other_charid: number;
  other_name: string;
  other_emote: string;
  self_offset: string;
  other_offset: string;
  other_flip: number;
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
export type MSPacketServer = Omit<MSPacket, "other_name" | "other_emote">;

const str = (v: string | undefined) => unescapeChat(v ?? "");
const num = (v: string | undefined) => Number(v) || 0;

export const MS: PacketCodec<MSPacket> = {
  decode(args) {
    return {
      desk_mod: str(args[1]),
      preanim: str(args[2]),
      character: str(args[3]),
      emote: str(args[4]),
      message: str(args[5]),
      side: str(args[6]),
      sfx_name: str(args[7]),
      emote_modifier: num(args[8]),
      char_id: num(args[9]),
      sfx_delay: num(args[10]),
      shout_modifier: num(args[11]),
      evidence: str(args[12]),
      flip: num(args[13]),
      realization: num(args[14]),
      text_color: num(args[15]),
      showname: str(args[16]),
      other_charid: num(args[17]),
      other_name: str(args[18]),
      other_emote: str(args[19]),
      self_offset: args[20] ?? "",
      other_offset: args[21] ?? "",
      other_flip: num(args[22]),
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
      escapeChat(p.desk_mod),
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
      escapeChat(p.evidence),
      p.flip,
      p.realization,
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
      desk_mod: str(args[1]),
      preanim: str(args[2]),
      character: str(args[3]),
      emote: str(args[4]),
      message: str(args[5]),
      side: str(args[6]),
      sfx_name: str(args[7]),
      emote_modifier: num(args[8]),
      char_id: num(args[9]),
      sfx_delay: num(args[10]),
      shout_modifier: num(args[11]),
      evidence: str(args[12]),
      flip: num(args[13]),
      realization: num(args[14]),
      text_color: num(args[15]),
      showname: str(args[16]),
      other_charid: num(args[17]),
      // Server-receiver form skips other_name (18) and other_emote (19).
      self_offset: args[18] ?? "",
      other_offset: args[19] ?? "",
      other_flip: num(args[20]),
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
      escapeChat(p.desk_mod),
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
      escapeChat(p.evidence),
      p.flip,
      p.realization,
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
 * Handles an in-character chat message.
 */
export const handleMS = (packet: MSPacket) => {
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
  const msg_nameplate = char?.showname ?? packet.character;
  const msg_blips = char?.blips ?? "male";
  const char_chatbox = char?.chat ?? "default";
  const char_muted = char?.muted ?? false;

  if (char_muted) return;

  // self_offset/other_offset wire format is `x<and>y`; destructure with
  // defaults so missing/empty offsets degrade to "0"/"0" rather than NaN.
  const [self_x = "0", self_y = "0"] = packet.self_offset.split("<and>");
  const [other_x = "0", other_y = "0"] = packet.other_offset.split("<and>");

  const chatmsg = {
    deskmod: Number(safeTags(packet.desk_mod).toLowerCase()),
    preanim: safeTags(packet.preanim).toLowerCase(),
    nameplate: msg_nameplate,
    chatbox: char_chatbox,
    name: char_name,
    sprite: safeTags(packet.emote).toLowerCase(),
    content: safeTags(decodeChat(packet.message)),
    side: packet.side.toLowerCase(),
    sound: safeTags(packet.sfx_name).toLowerCase(),
    blips: safeTags(msg_blips),
    type: packet.emote_modifier,
    charid: char_id,
    snddelay: packet.sfx_delay,
    objection: packet.shout_modifier,
    evidence: Number(safeTags(packet.evidence)),
    flip: packet.flip,
    flash: packet.realization,
    color: packet.text_color,
    speed: UPDATE_INTERVAL,
    showname: safeTags(decodeChat(packet.showname)),
    other_charid: packet.other_charid,
    other_name: safeTags(packet.other_name),
    other_emote: safeTags(packet.other_emote),
    self_offset: [Number(self_x), Number(self_y)],
    other_offset: [Number(other_x), Number(other_y)],
    other_flip: packet.other_flip,
    noninterrupting_preanim: packet.noninterrupting_preanim,
    looping_sfx: Boolean(packet.sfx_looping),
    screenshake: packet.screenshake,
    frame_screenshake: safeTags(packet.frames_shake),
    frame_realization: safeTags(packet.frames_realization),
    frame_sfx: safeTags(packet.frames_sfx),
    additive: packet.additive,
    effects: packet.effect.split("|"),
  };

  if (chatmsg.content.trim() === "") {
    // blankpost: empty chatbox means hide it
    chatmsg.content = "";
    chatmsg.chatbox = "";
  }

  // our own message appeared, reset the buttons
  if (chatmsg.charid === client.charID) {
    resetICParams();
  }

  handle_ic_speaking(chatmsg); // no await
};
