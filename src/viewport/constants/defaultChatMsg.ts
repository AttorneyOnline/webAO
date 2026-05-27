import { ShoutModifier, Side } from "../../packets/MS";
import { ChatMsg } from "../interfaces/ChatMsg";

// Define UPDATE_INTERVAL locally to avoid circular dependency
const UPDATE_INTERVAL = 60;

export const defaultChatMsg: ChatMsg = {
  content: "",
  shout_modifier: ShoutModifier.NONE,
  sound: "",
  startpreanim: true,
  startspeaking: false,
  side: Side.WITNESS,
  color: 0,
  snddelay: 0,
  preanimdelay: 0,
  speed: UPDATE_INTERVAL,
  blips: "",
};
