import { UPDATE_INTERVAL } from "../../client.js";
import { ChatMsg } from "../interfaces/ChatMsg.js";

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
