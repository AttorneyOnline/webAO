import { client } from "../client";
import { setupCharacterBasic } from "../client/handleCharacterInfo";
import type { PacketCodec } from "../packets";
import queryParser from "../utils/queryParser";

const { mode } = queryParser();

/**
 * Server character list. The wire format packs each character's fields
 * (name/desc/evidence) into one `&`-delimited string per character slot.
 *
 * We keep the raw `&`-joined string per slot (without unescaping) because
 * downstream consumers re-split on `&` and unescape per-subfield. Unescaping
 * the whole slot here would convert `<and>` to literal `&` and corrupt the
 * split.
 */
export interface SCPacket {
  charData: string[];
}

export const SC: PacketCodec<SCPacket> = {
  decode(args) {
    return { charData: args.slice(1) };
  },
  encode(packet) {
    return `SC#${packet.charData.join("#")}#%`;
  },
};

/**
 * Handles incoming character information, containing all characters
 * in one packet.
 */
export const receiveSC = async (packet: SCPacket) => {
  if (mode === "watch") {
    // Spectators don't need to pick a character
    document.getElementById("client_charselect")!.style.display = "none";
  } else {
    document.getElementById("client_charselect")!.style.display = "block";
  }

  for (let i = 0; i < packet.charData.length; i++) {
    const chargs = packet.charData[i].split("&");
    setupCharacterBasic(chargs, i);
  }
  // We're done with the characters, request the music
  client.sender.sendServer("RM#%");
};
