import { client } from "../../client";
import {
  Flip,
  MSClient,
  MSServer,
  parseSide,
  type DeskModifier,
  type EmoteModifier,
  type MSPacketServer,
  type ShoutModifier,
  type TextColor,
} from "../../packets/MS";
import queryParser from "../../utils/queryParser";
const { mode } = queryParser();

/**
 * Sends an in-character chat message. The packet variant depends on
 * whether we're talking to a real server (Server-receiver form, no
 * `paired_name` / `paired_emote`) or replaying to ourselves
 * (Client-receiver form, fields included with empty values).
 */
export const sendIC = (
  desk_modifier: DeskModifier,
  preanim: string,
  name: string,
  emote: string,
  message: string,
  side: string,
  sfx_name: string,
  emote_modifier: EmoteModifier,
  sfx_delay: number,
  shout_modifier: ShoutModifier,
  evidence_id: number,
  flip: Flip,
  realization: boolean,
  text_color: TextColor,
  showname: string,
  paired_charid: string,
  self_hoffset: number,
  self_yoffset: number,
  noninterrupting_preanim: boolean,
  sfx_looping: boolean,
  screenshake: boolean,
  frames_shake: string,
  frames_realization: string,
  frames_sfx: string,
  additive: boolean,
  effect: string,
) => {
  const packet: MSPacketServer = {
    desk_modifier,
    preanim,
    character: name,
    emote,
    message,
    side: parseSide(side),
    sfx_name,
    emote_modifier,
    char_id: client.charID,
    sfx_delay,
    shout_modifier,
    evidence_id,
    flip,
    realization,
    text_color,
    showname,
    paired_charid: Number(paired_charid) || -1,
    self_offset: { x: self_hoffset, y: self_yoffset },
    noninterrupting_preanim,
    sfx_looping,
    screenshake,
    frames_shake,
    frames_realization,
    frames_sfx,
    additive,
    effect,
  };

  // In replay mode, sendServer routes the wire back through the local
  // dispatcher -- which expects Client-receiver form (with `other_*`
  // fields). Fill those in as zero/empty when self-sending.
  const wire =
    mode === "replay"
      ? MSClient.encode({
        ...packet,
        paired_name: "",
        paired_emote: "",
        paired_offset: { x: 0, y: 0 },
        paired_flip: Flip.NONE,
      })
      : MSServer.encode(packet);

  client.sender.sendServer(wire);
  if (mode === "replay") {
    (<HTMLInputElement>document.getElementById("client_ooclog")).value +=
      `wait#${
        (<HTMLInputElement>document.getElementById("client_replaytimer")).value
      }#%\r\n`;
  }
};
