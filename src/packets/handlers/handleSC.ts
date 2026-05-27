import queryParser from "../../utils/queryParser";

import { client } from "../../client";
import { setupCharacterBasic } from "../../client/handleCharacterInfo";
import type { SCPacket } from "../types/SC";
const { mode } = queryParser();

/**
 * Handles incoming character information, containing all characters
 * in one packet.
 */
export const handleSC = async (packet: SCPacket) => {
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
