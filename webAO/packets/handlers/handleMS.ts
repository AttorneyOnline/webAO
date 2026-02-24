/* eslint indent: ["error", 2, { "SwitchCase": 1 }] */

import { client, extrafeatures, UPDATE_INTERVAL } from "../../client";
import { handleCharacterInfo, ensureCharIni } from "../../client/handleCharacterInfo";
import { resetICParams } from "../../client/resetICParams";
import { prepChat, safeTags } from "../../encoding";
import { handle_ic_speaking } from "../../viewport/utils/handleICSpeaking";
import { getAssetPreloader } from "../../cache";
import type { PreloadManifest } from "../../cache/types";
import { appendICLog } from "../../client/appendICLog";
import { checkCallword } from "../../client/checkCallword";

// Message sequence counter to track which message should be rendered
let currentMessageSequence = 0;
/**
 * Handles an in-character chat message.
 * @param {*} args packet arguments
 */
export const handleMS = async (args: string[]) => {
  // duplicate message
  if (args[5] !== client.viewport.getChatmsg().content) {
    const char_id = Number(args[9]);
    const char_name = safeTags(args[3]);

    let msg_nameplate = args[3];
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
      msg_nameplate = args[3];
    }

    try {
      msg_blips = client.chars[char_id].blips;
    } catch (e) {}

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
        deskmod: Number(safeTags(args[1]).toLowerCase()),
        preanim: safeTags(args[2]).toLowerCase(), // get preanim
        nameplate: msg_nameplate,
        chatbox: char_chatbox,
        name: char_name,
        sprite: safeTags(args[4]).toLowerCase(),
        content: prepChat(args[5]), // Escape HTML tags
        side: args[6].toLowerCase(),
        sound: safeTags(args[7]).toLowerCase(),
        blips: safeTags(msg_blips),
        type: Number(args[8]),
        charid: char_id,
        snddelay: Number(args[10]),
        objection: Number(args[11]),
        evidence: Number(safeTags(args[12])),
        flip: Number(args[13]),
        flash: Number(args[14]),
        color: Number(args[15]),
        speed: UPDATE_INTERVAL,
        showname: "" as string,
        preanimdelay: 0,
        preloadManifest: undefined as PreloadManifest | undefined,
      };

      if (args.length > 16) {
        const extra_cccc = {
          showname: prepChat(args[16]),
          other_charid: Number(args[17]),
          other_name: safeTags(args[18]),
          other_emote: safeTags(args[19]),
          self_offset: args[20].split("<and>"), // HACK: here as well, client is fucked and uses this instead of &
          other_offset: args[21].split("<and>"),
          other_flip: Number(args[22]),
          noninterrupting_preanim: Number(args[23]),
        };
        chatmsg = Object.assign(extra_cccc, chatmsg);

        if (args.length > 24) {
          const extra_27 = {
            looping_sfx: Number(args[24]),
            screenshake: Number(args[25]),
            frame_screenshake: safeTags(args[26]),
            frame_realization: safeTags(args[27]),
            frame_sfx: safeTags(args[28]),
          };
          chatmsg = Object.assign(extra_27, chatmsg);

          if (args.length > 29) {
            const extra_28 = {
              additive: Number(args[29]),
              effects: args[30].split("|"),
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

      // Increment sequence and capture it for this message
      currentMessageSequence++;
      const thisMessageSequence = currentMessageSequence;

      // Log message immediately to preserve order (before async preload)
      appendICLog(
        chatmsg.content,
        chatmsg.showname,
        chatmsg.nameplate,
      );

      // Check callword immediately as well
      checkCallword(chatmsg.content, client.viewport.getSfxAudio());

      // Preload all assets before rendering
      const preloader = getAssetPreloader(client.emote_extensions);
      const manifest = await preloader.preloadForMessage(chatmsg);

      // Check if a newer message arrived during preload - if so, skip rendering this one
      if (thisMessageSequence !== currentMessageSequence) {
        console.debug("Skipping render for superseded message");
        return;
      }

      chatmsg.preloadManifest = manifest;
      chatmsg.preanimdelay = manifest.characters[0]?.preanimDuration ?? 0;

      if (manifest.failedAssets.length > 0) {
        console.warn("Failed to preload some assets:", manifest.failedAssets);
      }

      handle_ic_speaking(chatmsg);
    }
  }
};
