import { client, UPDATE_INTERVAL } from "../../client";
import { handleCharacterInfo, ensureCharIni } from "../../client/handleCharacterInfo";
import { resetICParams } from "../../client/resetICParams";
import { decodeChat, safeTags } from "../../encoding";
import { handle_ic_speaking } from "../../viewport/utils/handleICSpeaking";
import type { MSPacket } from "../types/MS";
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
