import { client, selectedShout } from "../client";
import { escapeChat } from "../encoding";
import {
  EmoteModifier,
  Flip,
  parseEmoteModifier,
  parseSide,
  parseTextColor,
} from "../packets/MS";

const input = (id: string) =>
  document.getElementById(id) as HTMLInputElement;
const isToggled = (id: string) =>
  document.getElementById(id)!.classList.contains("dark");

/**
 * Triggered when the Return key is pressed on the in-character chat input box.
 */
export function onEnter(event: KeyboardEvent) {
  if (event.keyCode !== 13) return false;

  const mychar = client.character;
  const myemo = client.emote;
  const sendSfx = input("sendsfx").checked;
  const sendPreanim = input("sendpreanim").checked;

  // sendpreanim toggle only flips between PREANIM and NO_PREANIM; don't
  // clobber zoom/objection variants from the ini.
  let emote_modifier = parseEmoteModifier(String(myemo.zoom));
  if (sendPreanim && emote_modifier === EmoteModifier.NO_PREANIM) {
    emote_modifier = EmoteModifier.PREANIM;
  } else if (!sendPreanim && emote_modifier === EmoteModifier.PREANIM) {
    emote_modifier = EmoteModifier.NO_PREANIM;
  }

  client.sender.sendIC({
    desk_modifier: myemo.desk_modifier,
    preanim: myemo.preanim,
    character: mychar.name,
    emote: myemo.emote,
    message: input("client_inputbox").value,
    side: parseSide(input("role_select").value || mychar.side),
    sfx_name: sendSfx ? myemo.sfx : "0",
    emote_modifier,
    char_id: client.charID,
    sfx_delay: sendSfx ? myemo.sfxdelay : 0,
    shout_modifier: selectedShout,
    evidence_id: client.evidence + 1,
    flip: isToggled("button_flip") ? Flip.HORIZONTAL : Flip.NONE,
    realization: isToggled("button_flash"),
    text_color: parseTextColor(input("textcolor").value),
    showname: escapeChat(input("ic_chat_name").value),
    paired_charid: Number(input("pair_select").value) || -1,
    self_offset: {
      x: Number(input("pair_offset").value) || 0,
      y: Number(input("pair_y_offset").value) || 0,
    },
    noninterrupting_preanim: input("check_nonint").checked,
    sfx_looping: input("check_loopsfx").checked,
    screenshake: isToggled("button_shake"),
    frames_shake: "-",
    frames_realization: "-",
    frames_sfx: "-",
    additive: input("check_additive").checked,
    effect: input("effect_select").value,
  });

  return false;
}
window.onEnter = onEnter;
