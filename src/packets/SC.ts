import { client } from "../client";
import { setupCharacterBasic } from "../client/handleCharacterInfo";
import queryParser from "../utils/queryParser";
import * as aolib from "../aolib";

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


/**
 * Handles incoming character information, containing all characters
 * in one packet.
 */
export const applyFullCharacterList = async (packet: aolib.Out<typeof aolib.SC>) => {
  if (mode === "watch") {
    // Spectators don't need to pick a character
    document.getElementById("client_charselect")!.style.display = "none";
  } else {
    document.getElementById("client_charselect")!.style.display = "block";
  }

  for (let i = 0; i < packet.char_data.length; i++) {
    const chargs = packet.char_data[i].split("&");
    setupCharacterBasic(chargs, i);
  }
  // We're done with the characters, request the music
  client.server.send.RM({});
};
