import type { DeskModifier, EmoteModifier, Side } from "../../packets/MS";
import { PreloadedAssets } from "./PreloadedAssets";

export interface ChatMsg {
  content: string;
  objection: number;
  sound: string;
  startpreanim?: boolean;
  startspeaking?: boolean;
  side: Side;
  color: number;
  snddelay: number;
  preanimdelay?: number;
  speed: number;
  blips: string;
  self_offset?: number[];
  other_offset?: number[];
  showname?: string;
  nameplate?: string;
  flip?: number;
  other_flip?: number;
  effects?: string[];
  desk_modifier?: DeskModifier;
  preanim?: string;
  other_name?: string;
  sprite?: string;
  name?: string;
  chatbox?: string;
  other_emote?: string;
  parsed?: HTMLSpanElement[];
  screenshake?: number;
  flash?: number;
  emote_modifier?: EmoteModifier;
  evidence?: number;
  looping_sfx?: boolean;
  noninterrupting_preanim?: number;
  additive?: boolean;
  preloadedAssets?: PreloadedAssets;
}
