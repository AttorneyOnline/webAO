import type {
  DeskModifier,
  EmoteModifier,
  Flip,
  Offset,
  ShoutModifier,
  Side,
  TextColor,
} from "../../packets/MS";
import { PreloadedAssets } from "./PreloadedAssets";

export interface ChatMsg {
  content: string;
  shout_modifier: ShoutModifier;
  sound: string;
  startpreanim?: boolean;
  startspeaking?: boolean;
  side: Side;
  text_color: TextColor;
  snddelay: number;
  preanimdelay?: number;
  speed: number;
  blips: string;
  self_offset?: Offset;
  other_offset?: Offset;
  showname?: string;
  nameplate?: string;
  flip?: Flip;
  other_flip?: Flip;
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
  realization?: boolean;
  emote_modifier?: EmoteModifier;
  evidence_id?: number;
  looping_sfx?: boolean;
  noninterrupting_preanim?: number;
  additive?: boolean;
  preloadedAssets?: PreloadedAssets;
}
