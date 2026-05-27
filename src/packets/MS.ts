import { client, UPDATE_INTERVAL } from "../client";
import { handleCharacterInfo, ensureCharIni } from "../client/handleCharacterInfo";
import { resetICParams } from "../client/resetICParams";
import { decodeChat, escapeChat, safeTags, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";
import { handle_ic_speaking } from "../viewport/utils/handleICSpeaking";

/**
 * In-character chat message. The wire format has accreted a number of
 * trailing field groups over the years; each group is all-or-nothing. The
 * codec only requires the base 15 fields; everything after `textColor` is
 * optional and present together with later groups.
 *
 * The `selfOffset` and `otherOffset` fields are intentionally kept as raw
 * strings: AO2-Client serializes them with `<and>` instead of `&` (a
 * historical wart that all servers have adopted), and the handler splits
 * them on `<and>` directly. Unescaping them here would break that.
 *
 * Field grouping (matches the legacy handler's branches):
 *   base       : indices 1..15  (deskMod through textColor)
 *   cccc       : indices 16..23 (showname through nonInterruptingPreanim)
 *   2.7 / 2.8  : indices 24..28 (looping_sfx through frame_sfx)
 *   2.8        : indices 29..30 (additive, effect)
 */
export interface MSPacket {
  deskMod: string;
  preanim: string;
  character: string;
  emote: string;
  message: string;
  side: string;
  sfxName: string;
  emoteModifier: number;
  charId: number;
  sfxDelay: number;
  shoutModifier: number;
  evidence: string;
  flip: number;
  realization: number;
  textColor: number;
  // cccc group
  showname?: string;
  otherCharId?: number;
  otherName?: string;
  otherEmote?: string;
  selfOffset?: string;
  otherOffset?: string;
  otherFlip?: number;
  nonInterruptingPreanim?: number;
  // 2.7 group
  loopingSfx?: number;
  screenshake?: number;
  framesShake?: string;
  framesRealization?: string;
  framesSfx?: string;
  // 2.8 group
  additive?: number;
  effect?: string;
}

export const MS: PacketCodec<MSPacket> = {
  decode(args) {
    const packet: MSPacket = {
      deskMod: unescapeChat(args[1] ?? ""),
      preanim: unescapeChat(args[2] ?? ""),
      character: unescapeChat(args[3] ?? ""),
      emote: unescapeChat(args[4] ?? ""),
      message: unescapeChat(args[5] ?? ""),
      side: unescapeChat(args[6] ?? ""),
      sfxName: unescapeChat(args[7] ?? ""),
      emoteModifier: Number(args[8]),
      charId: Number(args[9]),
      sfxDelay: Number(args[10]),
      shoutModifier: Number(args[11]),
      evidence: unescapeChat(args[12] ?? ""),
      flip: Number(args[13]),
      realization: Number(args[14]),
      textColor: Number(args[15]),
    };
    if (args.length > 16) {
      packet.showname = unescapeChat(args[16] ?? "");
      packet.otherCharId = Number(args[17]);
      packet.otherName = unescapeChat(args[18] ?? "");
      packet.otherEmote = unescapeChat(args[19] ?? "");
      // Raw form preserved: AO2-Client (and every server since) uses literal
      // `<and>` rather than `&` to separate the x/y offset subfields.
      packet.selfOffset = args[20] ?? "";
      packet.otherOffset = args[21] ?? "";
      packet.otherFlip = Number(args[22]);
      packet.nonInterruptingPreanim = Number(args[23]);
      if (args.length > 24) {
        packet.loopingSfx = Number(args[24]);
        packet.screenshake = Number(args[25]);
        packet.framesShake = unescapeChat(args[26] ?? "");
        packet.framesRealization = unescapeChat(args[27] ?? "");
        packet.framesSfx = unescapeChat(args[28] ?? "");
        if (args.length > 29) {
          packet.additive = Number(args[29]);
          packet.effect = unescapeChat(args[30] ?? "");
        }
      }
    }
    return packet;
  },
  encode(packet) {
    let out =
      `MS#${packet.deskMod}#${escapeChat(packet.preanim)}#${escapeChat(packet.character)}#${escapeChat(packet.emote)}` +
      `#${escapeChat(packet.message)}#${escapeChat(packet.side)}#${escapeChat(packet.sfxName)}#${packet.emoteModifier}` +
      `#${packet.charId}#${packet.sfxDelay}#${packet.shoutModifier}#${escapeChat(packet.evidence)}` +
      `#${packet.flip}#${packet.realization}#${packet.textColor}`;
    if (packet.showname !== undefined) {
      out +=
        `#${escapeChat(packet.showname)}#${packet.otherCharId ?? 0}` +
        `#${escapeChat(packet.otherName ?? "")}#${escapeChat(packet.otherEmote ?? "")}` +
        `#${packet.selfOffset ?? ""}#${packet.otherOffset ?? ""}` +
        `#${packet.otherFlip ?? 0}#${packet.nonInterruptingPreanim ?? 0}`;
      if (packet.loopingSfx !== undefined) {
        out +=
          `#${packet.loopingSfx}#${packet.screenshake ?? 0}` +
          `#${escapeChat(packet.framesShake ?? "")}#${escapeChat(packet.framesRealization ?? "")}#${escapeChat(packet.framesSfx ?? "")}`;
        if (packet.additive !== undefined) {
          out += `#${packet.additive}#${escapeChat(packet.effect ?? "")}`;
        }
      }
    }
    return `${out}#%`;
  },
};

/**
 * Handles an in-character chat message.
 */
export const handleMS = (packet: MSPacket) => {
  // duplicate message
  if (packet.message !== client.viewport.getChatmsg().content) {
    const char_id = packet.charId;
    const char_name = safeTags(packet.character);

    let msg_nameplate = packet.character;
    let msg_blips = "male";
    let char_chatbox = "default";
    let char_muted = false;

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

    try {
      msg_nameplate = client.chars[char_id].showname;
    } catch (e) {
      msg_nameplate = packet.character;
    }

    try {
      msg_blips = client.chars[char_id].blips;
    } catch {
      // keep default blip
    }

    try {
      char_chatbox = client.chars[char_id].chat;
    } catch (e) {
      char_chatbox = "default";
    }

    try {
      char_muted = client.chars[char_id].muted;
    } catch (e) {
      char_muted = false;
      console.error("we're still missing some character data");
    }

    if (char_muted === false) {
      let chatmsg = {
        deskmod: Number(safeTags(packet.deskMod).toLowerCase()),
        preanim: safeTags(packet.preanim).toLowerCase(), // get preanim
        nameplate: msg_nameplate,
        chatbox: char_chatbox,
        name: char_name,
        sprite: safeTags(packet.emote).toLowerCase(),
        content: safeTags(decodeChat(packet.message)), // Escape HTML tags
        side: packet.side.toLowerCase(),
        sound: safeTags(packet.sfxName).toLowerCase(),
        blips: safeTags(msg_blips),
        type: packet.emoteModifier,
        charid: char_id,
        snddelay: packet.sfxDelay,
        objection: packet.shoutModifier,
        evidence: Number(safeTags(packet.evidence)),
        flip: packet.flip,
        flash: packet.realization,
        color: packet.textColor,
        speed: UPDATE_INTERVAL,
      };

      if (packet.showname !== undefined) {
        const extra_cccc = {
          showname: safeTags(decodeChat(packet.showname)),
          other_charid: packet.otherCharId ?? 0,
          other_name: safeTags(packet.otherName ?? ""),
          other_emote: safeTags(packet.otherEmote ?? ""),
          self_offset: (packet.selfOffset ?? "").split("<and>"), // HACK: here as well, client is fucked and uses this instead of &
          other_offset: (packet.otherOffset ?? "").split("<and>"),
          other_flip: packet.otherFlip ?? 0,
          noninterrupting_preanim: packet.nonInterruptingPreanim ?? 0,
        };
        chatmsg = Object.assign(extra_cccc, chatmsg);

        if (packet.loopingSfx !== undefined) {
          const extra_27 = {
            looping_sfx: packet.loopingSfx,
            screenshake: packet.screenshake ?? 0,
            frame_screenshake: safeTags(packet.framesShake ?? ""),
            frame_realization: safeTags(packet.framesRealization ?? ""),
            frame_sfx: safeTags(packet.framesSfx ?? ""),
          };
          chatmsg = Object.assign(extra_27, chatmsg);

          if (packet.additive !== undefined) {
            const extra_28 = {
              additive: packet.additive,
              effects: (packet.effect ?? "").split("|"),
            };
            chatmsg = Object.assign(extra_28, chatmsg);
          } else {
            const extra_28 = {
              additive: 0,
              effects: ["", "", ""],
            };
            chatmsg = Object.assign(extra_28, chatmsg);
          }
        } else {
          const extra_27 = {
            looping_sfx: 0,
            screenshake: 0,
            frame_screenshake: "",
            frame_realization: "",
            frame_sfx: "",
          };
          chatmsg = Object.assign(extra_27, chatmsg);
          const extra_28 = {
            additive: 0,
            effects: ["", "", ""],
          };
          chatmsg = Object.assign(extra_28, chatmsg);
        }
      } else {
        const extra_cccc = {
          showname: "",
          other_charid: 0,
          other_name: "",
          other_emote: "",
          self_offset: [0, 0],
          other_offset: [0, 0],
          other_flip: 0,
          noninterrupting_preanim: 0,
        };
        chatmsg = Object.assign(extra_cccc, chatmsg);
        const extra_27 = {
          looping_sfx: 0,
          screenshake: 0,
          frame_screenshake: "",
          frame_realization: "",
          frame_sfx: "",
        };
        chatmsg = Object.assign(extra_27, chatmsg);
        const extra_28 = {
          additive: 0,
          effects: ["", "", ""],
        };
        chatmsg = Object.assign(extra_28, chatmsg);
      }

      if (chatmsg.content.trim() === "") {
        //blankpost
        chatmsg.content = "";
        // empty string as chatbox means hide it
        chatmsg.chatbox = "";
      }

      // our own message appeared, reset the buttons
      if (chatmsg.charid === client.charID) {
        resetICParams();
      }

      handle_ic_speaking(chatmsg); // no await
    }
  }
};
