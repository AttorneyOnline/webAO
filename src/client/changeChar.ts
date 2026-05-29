import { client } from "../client";
import { AO_HOST } from "./aoHost";
import { ensureCharIni } from "./handleCharacterInfo";
import { pickEmotion } from "../dom/pickEmotion";
import { attachSpritePreview } from "../dom/spritePreview";
import { updateActionCommands } from "../dom/updateActionCommands";
import fileExists from "../utils/fileExists";
import type * as aolib from "../aolib";

/** PV: server assigns a character to this player. */
export function applyCharacterPick(packet: aolib.PVPacket) {
  changeChar(packet.char_id);
}

/**
 * Switch the player to a different character. Loads the char's ini,
 * rebuilds the emote panel by probing button extensions, and toggles
 * the "custom" button based on whether a custom anim exists.
 *
 * Called by `receivePV` (server-assigned character) and by `iniedit`
 * (in-place ini reload).
 */
export async function changeChar(char_id: number) {
  client.charID = char_id;
  document.getElementById("client_waiting")!.style.display = "none";
  document.getElementById("client_charselect")!.style.display = "none";

  const me = client.chars[client.charID];
  client.selectedEmote = -1;
  const { emotes } = client;
  const emotesList = document.getElementById("client_emo");
  emotesList.style.display = "";
  emotesList.innerHTML = ""; // Clear emote box
  const ini = await ensureCharIni(client.charID);
  me.side = ini.options.side;
  updateActionCommands(me.side);
  if (ini.emotions.number === 0) {
    emotesList.innerHTML = `<span
						id="emo_0"
						alt="unavailable"
						class="emote_button">No emotes available</span>`;
  } else {
    // Probe extensions once using button1_off, then reuse for all emotes
    const charPath = `${AO_HOST}characters/${encodeURI(me.name.toLowerCase())}/emotions/`;
    let emoteExtension = client.emotions_extensions[0];
    for (const extension of client.emotions_extensions) {
      if (await fileExists(`${charPath}button1_off${extension}`)) {
        emoteExtension = extension;
        break;
      }
    }

    for (let i = 1; i <= ini.emotions.number; i++) {
      try {
        const emoteinfo = ini.emotions[i].split("#");
        let esfx;
        let esfxd;
        try {
          esfx = ini.soundn?.[i] || "0";
          esfxd = ini.soundt?.[i] ? Number(ini.soundt[i]) : 0;
        } catch (e) {
          esfx = "0";
          esfxd = 0;
        }

        const url = `${charPath}button${i}_off${emoteExtension}`;

        emotes[i] = {
          desc: emoteinfo[0].toLowerCase(),
          preanim: emoteinfo[1].toLowerCase(),
          emote: emoteinfo[2].toLowerCase(),
          zoom: Number(emoteinfo[3]) || 0,
          desk_modifier: Number(emoteinfo[4]) || 1,
          sfx: esfx.toLowerCase(),
          sfxdelay: esfxd,
          frame_screenshake: "",
          frame_realization: "",
          frame_sfx: "",
          button: url,
        };

        addEmoteButton(i, url, emotes[i].desc, me.name.toLowerCase(), emotes[i].emote);

        if (i === 1) pickEmotion(1);
      } catch (e) {
        console.error(`missing emote ${i}`);
      }
    }
  }

  const customCharPath = `${AO_HOST}characters/${encodeURI(me.name.toLowerCase())}/custom`;
  const customExtensions = [".gif", ".webp", ".apng", ".png"];
  const customExists = (
    await Promise.all(customExtensions.map((ext) => fileExists(`${customCharPath}${ext}`)))
  ).some(Boolean);
  document.getElementById("button_4")!.style.display = customExists ? "" : "none";
}

function addEmoteButton(
  i: number,
  imgurl: string,
  desc: string,
  charactername: string,
  emotename: string,
) {
  const emotesList = document.getElementById("client_emo");
  const emote_item = new Image();
  emote_item.id = "emo_" + i;
  emote_item.className = "emote_button";
  emote_item.src = imgurl;
  emote_item.alt = desc;
  emote_item.onclick = () => {
    pickEmotion(i);
  };
  emotesList.appendChild(emote_item);
  attachSpritePreview(emote_item, charactername, emotename, desc);
}
