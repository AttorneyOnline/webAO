import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

/**
 * In-character chat message. The wire format has accreted a number of
 * trailing field groups over the years; each group is all-or-nothing. The
 * codec only requires the base 15 fields; everything after `textColor` is
 * optional and present together with later groups.
 *
 * The `selfOffset` and `otherOffset` fields are intentionally kept as raw
 * strings: AO2-Client serializes them with `<and>` instead of `&` (a
 * historical wart that all servers have adopted), and the handler splits
 * them on `<and>` directly. Unescaping them here would break that.
 *
 * Field grouping (matches the legacy handler's branches):
 *   base       : indices 1..15  (deskMod through textColor)
 *   cccc       : indices 16..23 (showname through nonInterruptingPreanim)
 *   2.7 / 2.8  : indices 24..28 (looping_sfx through frame_sfx)
 *   2.8        : indices 29..30 (additive, effect)
 */
export interface MSPacket {
  deskMod: string;
  preanim: string;
  character: string;
  emote: string;
  message: string;
  side: string;
  sfxName: string;
  emoteModifier: number;
  charId: number;
  sfxDelay: number;
  shoutModifier: number;
  evidence: string;
  flip: number;
  realization: number;
  textColor: number;
  // cccc group
  showname?: string;
  otherCharId?: number;
  otherName?: string;
  otherEmote?: string;
  selfOffset?: string;
  otherOffset?: string;
  otherFlip?: number;
  nonInterruptingPreanim?: number;
  // 2.7 group
  loopingSfx?: number;
  screenshake?: number;
  framesShake?: string;
  framesRealization?: string;
  framesSfx?: string;
  // 2.8 group
  additive?: number;
  effect?: string;
}

export const MS: PacketCodec<MSPacket> = {
  decode(args) {
    const packet: MSPacket = {
      deskMod: unescapeChat(args[1] ?? ""),
      preanim: unescapeChat(args[2] ?? ""),
      character: unescapeChat(args[3] ?? ""),
      emote: unescapeChat(args[4] ?? ""),
      message: unescapeChat(args[5] ?? ""),
      side: unescapeChat(args[6] ?? ""),
      sfxName: unescapeChat(args[7] ?? ""),
      emoteModifier: Number(args[8]),
      charId: Number(args[9]),
      sfxDelay: Number(args[10]),
      shoutModifier: Number(args[11]),
      evidence: unescapeChat(args[12] ?? ""),
      flip: Number(args[13]),
      realization: Number(args[14]),
      textColor: Number(args[15]),
    };
    if (args.length > 16) {
      packet.showname = unescapeChat(args[16] ?? "");
      packet.otherCharId = Number(args[17]);
      packet.otherName = unescapeChat(args[18] ?? "");
      packet.otherEmote = unescapeChat(args[19] ?? "");
      // Raw form preserved: AO2-Client (and every server since) uses literal
      // `<and>` rather than `&` to separate the x/y offset subfields.
      packet.selfOffset = args[20] ?? "";
      packet.otherOffset = args[21] ?? "";
      packet.otherFlip = Number(args[22]);
      packet.nonInterruptingPreanim = Number(args[23]);
      if (args.length > 24) {
        packet.loopingSfx = Number(args[24]);
        packet.screenshake = Number(args[25]);
        packet.framesShake = unescapeChat(args[26] ?? "");
        packet.framesRealization = unescapeChat(args[27] ?? "");
        packet.framesSfx = unescapeChat(args[28] ?? "");
        if (args.length > 29) {
          packet.additive = Number(args[29]);
          packet.effect = unescapeChat(args[30] ?? "");
        }
      }
    }
    return packet;
  },
  encode(packet) {
    let out =
      `MS#${packet.deskMod}#${escapeChat(packet.preanim)}#${escapeChat(packet.character)}#${escapeChat(packet.emote)}` +
      `#${escapeChat(packet.message)}#${escapeChat(packet.side)}#${escapeChat(packet.sfxName)}#${packet.emoteModifier}` +
      `#${packet.charId}#${packet.sfxDelay}#${packet.shoutModifier}#${escapeChat(packet.evidence)}` +
      `#${packet.flip}#${packet.realization}#${packet.textColor}`;
    if (packet.showname !== undefined) {
      out +=
        `#${escapeChat(packet.showname)}#${packet.otherCharId ?? 0}` +
        `#${escapeChat(packet.otherName ?? "")}#${escapeChat(packet.otherEmote ?? "")}` +
        `#${packet.selfOffset ?? ""}#${packet.otherOffset ?? ""}` +
        `#${packet.otherFlip ?? 0}#${packet.nonInterruptingPreanim ?? 0}`;
      if (packet.loopingSfx !== undefined) {
        out +=
          `#${packet.loopingSfx}#${packet.screenshake ?? 0}` +
          `#${escapeChat(packet.framesShake ?? "")}#${escapeChat(packet.framesRealization ?? "")}#${escapeChat(packet.framesSfx ?? "")}`;
        if (packet.additive !== undefined) {
          out += `#${packet.additive}#${escapeChat(packet.effect ?? "")}`;
        }
      }
    }
    return `${out}#%`;
  },
};
