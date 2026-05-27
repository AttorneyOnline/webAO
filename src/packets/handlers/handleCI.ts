import { client } from "../../client";
import { handleCharacterInfo } from "../../client/handleCharacterInfo";
import type { CIPacket } from "../types/CI";

/**
 * Handles incoming character information, bundling multiple characters
 * per packet.
 */
export const handleCI = (packet: CIPacket) => {
  document.getElementById("client_loadingtext")!.innerHTML =
    `Loading Character ${packet.batchIndex}/${client.char_list_length}`;
  for (const { index, data } of packet.entries) {
    const chargs = data.split("&");
    setTimeout(() => handleCharacterInfo(chargs, index), 500);
  }
  // Request the next pack
  client.sender.sendServer(`AN#${packet.batchIndex / 10 + 1}#%`);
};
