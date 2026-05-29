import type * as aolib from "../../aolib";
import { PreloadedAssets } from "./PreloadedAssets";

/**
 * The viewport's in-character message state. Composed as the incoming
 * MS broadcast packet plus a render-state overlay — display-safe
 * transforms of a few packet fields, character-derived display data
 * that doesn't live on the wire, and chat-tick render-loop state.
 */
export type ChatMsg = aolib.MSPacket & {
  // Display-safe versions of packet fields (shadow the raw value when
  // the name matches; new fields otherwise).
  content: string;
  name: string;
  sprite: string;
  sound: string;
  preanim: string;
  showname: string;
  paired_name: string;
  paired_emote: string;
  effects: string[];

  // Character-derived display data (from client.chars[packet.char_id]).
  nameplate: string;
  chatbox: string;
  blips: string;

  // Chat-tick render-loop state.
  parsed?: HTMLSpanElement[];
  preloadedAssets?: PreloadedAssets;
  startpreanim?: boolean;
  startspeaking?: boolean;
  preanimdelay?: number;
  speed: number;
};
