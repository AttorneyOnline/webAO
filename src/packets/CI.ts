import { client } from "../client";
import { handleCharacterInfo } from "../client/handleCharacterInfo";
import * as aolib from "../aolib";

/**
 * Incremental character info. Each entry's `data` is an `&`-delimited
 * blob describing one character; the handler splits it again here
 * since aolib keeps it as one opaque string.
 */
export const applyCharacterBatch = (packet: aolib.Out<typeof aolib.CI>) => {
  document.getElementById("client_loadingtext")!.innerHTML =
    `Loading Character ${packet.batchIndex}/${client.char_list_length}`;
  for (const { index, data } of packet.entries) {
    const chargs = data.split("&");
    setTimeout(() => handleCharacterInfo(chargs, index), 500);
  }
  client.server.send.AN({ batch: packet.batchIndex / 10 + 1 });
};
