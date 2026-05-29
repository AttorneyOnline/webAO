import * as aolib from "../../aolib";
import {
  DeskModifier,
  EmoteModifier,
  Flip,
  ShoutModifier,
  Side,
  TextColor,
} from "../../aolib";
import { ChatMsg } from "../interfaces/ChatMsg";

// Define UPDATE_INTERVAL locally to avoid circular dependency
const UPDATE_INTERVAL = 60;

const defaultPacket: aolib.Out<typeof aolib.MSBroadcast> = {
  desk_modifier: DeskModifier.SHOWN,
  preanim: "",
  character: "",
  emote: "",
  message: "",
  side: Side.WITNESS,
  sfx_name: "",
  emote_modifier: EmoteModifier.NO_PREANIM,
  char_id: -1,
  sfx_delay: 0,
  shout_modifier: ShoutModifier.NONE,
  evidence_id: 0,
  flip: Flip.NONE,
  realization: false,
  text_color: TextColor.WHITE,
  showname: "",
  paired_charid: -1,
  paired_name: "",
  paired_emote: "",
  offset: { x: 0, y: 0 },
  paired_offset: { x: 0, y: 0 },
  paired_flip: Flip.NONE,
  noninterrupting_preanim: false,
  sfx_looping: false,
  screenshake: false,
  frames_shake: "",
  frames_realization: "",
  frames_sfx: "",
  additive: false,
  effect: "",
};

export const defaultChatMsg: ChatMsg = {
  ...defaultPacket,
  // Display-safe shadows / pure extras
  content: "",
  name: "",
  sprite: "",
  sound: "",
  effects: [],
  // Char-derived
  nameplate: "",
  chatbox: "",
  blips: "",
  // Render state
  startpreanim: true,
  startspeaking: false,
  preanimdelay: 0,
  speed: UPDATE_INTERVAL,
};
