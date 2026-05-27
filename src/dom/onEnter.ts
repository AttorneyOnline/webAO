import { client, selectedShout } from "../client";
import { escapeChat } from "../encoding";
import {
  EmoteModifier,
  Flip,
  parseEmoteModifier,
  parseTextColor,
} from "../packets/MS";

/**
 * Triggered when the Return key is pressed on the in-character chat input box.
 * @param {KeyboardEvent} event
 */
export function onEnter(event: KeyboardEvent) {
  if (event.keyCode === 13) {
    const mychar = client.character;
    const myemo = client.emote;
    const evi = client.evidence + 1;
    const flip = document
      .getElementById("button_flip")!
      .classList.contains("dark")
      ? Flip.HORIZONTAL
      : Flip.NONE;
    const flash = Boolean(
      document.getElementById("button_flash")!.classList.contains("dark"),
    );
    const screenshake = Boolean(
      document.getElementById("button_shake")!.classList.contains("dark"),
    );
    const noninterrupting_preanim = Boolean(
      (<HTMLInputElement>document.getElementById("check_nonint")).checked,
    );
    const looping_sfx = Boolean(
      (<HTMLInputElement>document.getElementById("check_loopsfx")).checked,
    );
    const color = parseTextColor(
      (<HTMLInputElement>document.getElementById("textcolor")).value,
    );
    const showname = escapeChat(
      (<HTMLInputElement>document.getElementById("ic_chat_name")).value,
    );
    const text = (<HTMLInputElement>document.getElementById("client_inputbox"))
      .value;
    const pairchar = (<HTMLInputElement>document.getElementById("pair_select"))
      .value;
    const pairoffset = Number(
      (<HTMLInputElement>document.getElementById("pair_offset")).value,
    );
    const pairyoffset = Number(
      (<HTMLInputElement>document.getElementById("pair_y_offset")).value,
    );
    const myrole = (<HTMLInputElement>document.getElementById("role_select"))
      .value
      ? (<HTMLInputElement>document.getElementById("role_select")).value
      : mychar.side;
    const additive = Boolean(
      (<HTMLInputElement>document.getElementById("check_additive")).checked,
    );
    const effect = (<HTMLInputElement>document.getElementById("effect_select"))
      .value;

    let sfxname = "0";
    let sfxdelay = 0;
    let emote_mod: EmoteModifier = parseEmoteModifier(String(myemo.zoom));
    if ((<HTMLInputElement>document.getElementById("sendsfx")).checked) {
      sfxname = myemo.sfx;
      sfxdelay = myemo.sfxdelay;
    }

    // not to overwrite a 5/6 from the ini or anything else
    if ((<HTMLInputElement>document.getElementById("sendpreanim")).checked) {
      if (emote_mod === EmoteModifier.NO_PREANIM) {
        emote_mod = EmoteModifier.PREANIM;
      }
    } else if (emote_mod === EmoteModifier.PREANIM) {
      emote_mod = EmoteModifier.NO_PREANIM;
    }

    client.sender.sendIC(
      myemo.desk_modifier,
      myemo.preanim,
      mychar.name,
      myemo.emote,
      text,
      myrole,
      sfxname,
      emote_mod,
      sfxdelay,
      selectedShout,
      evi,
      flip,
      flash,
      color,
      showname,
      pairchar,
      pairoffset,
      pairyoffset,
      noninterrupting_preanim,
      looping_sfx,
      screenshake,
      "-",
      "-",
      "-",
      additive,
      effect,
    );
  }
  return false;
}
window.onEnter = onEnter;
