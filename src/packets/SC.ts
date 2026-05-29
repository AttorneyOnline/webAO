import { client } from "../client";
import { setupCharacterBasic } from "../client/handleCharacterInfo";
import queryParser from "../utils/queryParser";
import type * as aolib from "../aolib";

const { mode } = queryParser();

/**
 * Apply the full character list. Each entry's `&`-delimited fields
 * are re-split here and forwarded to `setupCharacterBasic`. Once the
 * roster is loaded we ask the server for the music list (`RM`).
 */
export const applyFullCharacterList = async (packet: aolib.Out<typeof aolib.SC>) => {
  if (mode === "watch") {
    // Spectators don't pick a character
    document.getElementById("client_charselect")!.style.display = "none";
  } else {
    document.getElementById("client_charselect")!.style.display = "block";
  }

  for (let i = 0; i < packet.char_data.length; i++) {
    const chargs = packet.char_data[i].split("&");
    setupCharacterBasic(chargs, i);
  }
  client.server.send.RM({});
};
