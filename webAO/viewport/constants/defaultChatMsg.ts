import { ChatMsg } from "../interfaces/ChatMsg";

// Define UPDATE_INTERVAL locally to avoid circular dependency
const UPDATE_INTERVAL = 60;

export const defaultChatMsg = {
  content: "",
  objection: 0,
  sound: "",
  startpreanim: true,
  startspeaking: false,
  side: null,
  color: 0,
  snddelay: 0,
  preanimdelay: 0,
  speed: UPDATE_INTERVAL,
} as ChatMsg;
