import type { MSPacketClient } from "../../packets/MS";
import { PreloadedAssets } from "./PreloadedAssets";

/**
 * The viewport's in-character message state. Composed as the incoming MS
 * packet (`MSPacketClient`) plus a render-state overlay -- the latter
 * carries display-safe transforms of a few packet fields (HTML-escaped,
 * lowercased filenames, parsed effects array), character-derived display
 * data that doesn't live on the wire (`nameplate`, `chatbox`, `blips`
 * sound), and chat-tick render-loop state (`parsed`, `preloadedAssets`,
 * `speed`, …).
 *
 * Where the field names overlap (`preanim`, `showname`, `paired_name`,
 * `paired_emote`), the render state shadows the packet's raw value with
 * a `safeHtmlTags`'d display form. Both have type `string`, so the
 * intersection collapses to one field; the runtime value is whatever the
 * builder assigns last (= the display form).
 */
export type ChatMsg = MSPacketClient & {
  // Display-safe versions of packet fields (shadow the raw value when
  // the name matches; new fields otherwise).
  content: string; // safeHtmlTags(unescapeUnicode(packet.message))
  name: string; // safeHtmlTags(packet.character)
  sprite: string; // safeHtmlTags(packet.emote.toLowerCase())
  sound: string; // safeHtmlTags(packet.sfx_name.toLowerCase())
  preanim: string; // safeHtmlTags(packet.preanim.toLowerCase())
  showname: string; // safeHtmlTags(unescapeUnicode(packet.showname))
  paired_name: string; // safeHtmlTags(packet.paired_name)
  paired_emote: string; // safeHtmlTags(packet.paired_emote)
  effects: string[]; // packet.effect.split("|")

  // Character-derived display data (from client.chars[packet.char_id]).
  nameplate: string;
  chatbox: string;
  blips: string; // blip-sound name, NOT the (removed) packet.blips field.

  // Chat-tick render-loop state.
  parsed?: HTMLSpanElement[];
  preloadedAssets?: PreloadedAssets;
  startpreanim?: boolean;
  startspeaking?: boolean;
  preanimdelay?: number;
  speed: number;
};
