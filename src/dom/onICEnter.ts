import { client, selectedShout } from "../client";
import { escapeFanta } from "../escaping";
import {
  EmoteModifier,
  Flip,
  parseEmoteModifier,
  parseSide,
  parseTextColor,
  sendMS,
  type MSPacketServer,
} from "../packets/MS";

const input = (id: string) =>
  document.getElementById(id) as HTMLInputElement;
const isToggled = (id: string) =>
  document.getElementById(id)!.classList.contains("dark");

/**
 * Triggered when the Return key is pressed on the in-character chat input box.
 */
export function onICEnter(event: KeyboardEvent) {
  if (event.key !== "Enter") return false;

  const my_char = client.character;
  const my_emote = client.emote;
  const sendSfx = input("sendsfx").checked;
  const sendPreanim = input("sendpreanim").checked;

  // sendpreanim toggle only flips between PREANIM and NO_PREANIM; don't
  // clobber zoom/objection variants from the ini.
  let emote_modifier = parseEmoteModifier(String(my_emote.zoom));
  if (sendPreanim && emote_modifier === EmoteModifier.NO_PREANIM) {
    emote_modifier = EmoteModifier.PREANIM;
  } else if (!sendPreanim && emote_modifier === EmoteModifier.PREANIM) {
    emote_modifier = EmoteModifier.NO_PREANIM;
  }

  const packet: MSPacketServer = {
    desk_modifier: my_emote.desk_modifier,
    preanim: my_emote.preanim,
    character: my_char.name,
    emote: my_emote.emote,
    message: input("client_inputbox").value,
    side: parseSide(input("role_select").value || my_char.side),
    sfx_name: sendSfx ? my_emote.sfx : "0",
    emote_modifier: emote_modifier,
    char_id: client.charID,
    sfx_delay: sendSfx ? my_emote.sfxdelay : 0,
    shout_modifier: selectedShout,
    evidence_id: client.evidence + 1,
    flip: isToggled("button_flip") ? Flip.HORIZONTAL : Flip.NONE,
    realization: isToggled("button_flash"),
    text_color: parseTextColor(input("textcolor").value),
    showname: escapeFanta(input("ic_chat_name").value),
    paired_charid: Number(input("pair_select").value) || -1,
    offset: {
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
  };
  sendMS(packet);

  return false;
}
