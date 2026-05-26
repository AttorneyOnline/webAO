import { extrafeatures } from "../../client";
import { escapeChat } from "../../encoding";
import { client } from "../../client";
import queryParser from "../../utils/queryParser";
const { mode } = queryParser();

/**
 * Sends an in-character chat message.
 * @param {number} deskmod controls the desk
 * @param {string} speaking who is speaking
 * @param {string} name the name of the current character
 * @param {string} silent whether or not it's silent
 * @param {string} message the message to be sent
 * @param {string} side the name of the side in the background
 * @param {string} sfx_name the name of the sound effect
 * @param {number} emote_modifier whether or not to zoom
 * @param {number} sfx_delay the delay (in milliseconds) to play the sound effect
 * @param {number} objection_modifier the number of the shout to play
 * @param {string} evidence the filename of evidence to show
 * @param {boolean} flip change to 1 to reverse sprite for position changes
 * @param {boolean} realization screen flash effect
 * @param {number} text_color text color
 * @param {string} showname custom name to be displayed (optional)
 * @param {number} other_charid paired character (optional)
 * @param {number} self_offset offset to paired character (optional)
 * @param {number} noninterrupting_preanim play the full preanim (optional)
 */
export const sendIC = (
  deskmod: number,
  preanim: string,
  name: string,
  emote: string,
  message: string,
  side: string,
  sfx_name: string,
  emote_modifier: number,
  sfx_delay: number,
  objection_modifier: number,
  evidence: number,
  flip: boolean,
  realization: boolean,
  text_color: number,
  showname: string,
  other_charid: string,
  self_hoffset: number,
  self_yoffset: number,
  noninterrupting_preanim: boolean,
  looping_sfx: boolean,
  screenshake: boolean,
  frame_screenshake: string,
  frame_realization: string,
  frame_sfx: string,
  additive: boolean,
  effect: string,
) => {
  let extra_cccc = "";
  let other_emote = "";
  let other_offset = "";
  let extra_27 = "";
  let extra_28 = "";

  if (extrafeatures.includes("cccc_ic_support")) {
    const self_offset = extrafeatures.includes("y_offset")
      ? `${self_hoffset}<and>${self_yoffset}`
      : self_hoffset; // HACK: this should be an & but client fucked it up and all the servers adopted it
    if (mode === "replay") {
      other_emote = "##";
      other_offset = "#0#0";
    }
    extra_cccc = `${escapeChat(
      showname,
    )}#${other_charid}${other_emote}#${self_offset}${other_offset}#${Number(
      noninterrupting_preanim,
    )}#`;

    if (extrafeatures.includes("looping_sfx")) {
      extra_27 = `${Number(looping_sfx)}#${Number(
        screenshake,
      )}#${frame_screenshake}#${frame_realization}#${frame_sfx}#`;
      if (extrafeatures.includes("effects")) {
        extra_28 = `${Number(additive)}#${escapeChat(effect)}#`;
      }
    }
  }

  const serverMessage =
    `MS#${deskmod}#${escapeChat(preanim)}#${escapeChat(name)}#${escapeChat(
      emote,
    )}` +
    `#${escapeChat(message)}#${escapeChat(side)}#${escapeChat(
      sfx_name,
    )}#${emote_modifier}` +
    `#${client.charID}#${sfx_delay}#${Number(objection_modifier)}#${Number(
      evidence,
    )}#${Number(flip)}#${Number(
      realization,
    )}#${text_color}#${extra_cccc}${extra_27}${extra_28}%`;

  client.sender.sendServer(serverMessage);
  if (mode === "replay") {
    (<HTMLInputElement>document.getElementById("client_ooclog")).value +=
      `wait#${
        (<HTMLInputElement>document.getElementById("client_replaytimer")).value
      }#%\r\n`;
  }
};
