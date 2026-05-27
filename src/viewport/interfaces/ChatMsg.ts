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
  paired_offset?: Offset;
  showname?: string;
  nameplate?: string;
  flip?: Flip;
  paired_flip?: Flip;
  effects?: string[];
  desk_modifier?: DeskModifier;
  preanim?: string;
  paired_name?: string;
  sprite?: string;
  name?: string;
  chatbox?: string;
  paired_emote?: string;
  parsed?: HTMLSpanElement[];
  screenshake?: boolean;
  realization?: boolean;
  emote_modifier?: EmoteModifier;
  evidence_id?: number;
  sfx_looping?: boolean;
  noninterrupting_preanim?: boolean;
  additive?: boolean;
  preloadedAssets?: PreloadedAssets;
}
