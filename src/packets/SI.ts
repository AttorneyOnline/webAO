import { client } from "../client";
import { fetchExtensions } from "../client/fetchLists";
import { applyFavourites } from "../dom/toggleFavourite";
import * as aolib from "../aolib";



/**
 * Received when the server announces its server info,
 * but we use it as a cue to begin retrieving characters.
 */
export const applyServerCounts = (packet: aolib.Out<typeof aolib.SI>) => {
  client.char_list_length = packet.char_cnt;
  client.evidence_list_length = packet.evi_cnt;
  client.music_list_length = packet.mus_cnt;

  fetchExtensions();

  // create the charselect grid, to be filled by the character loader
  document.getElementById("client_chartable")!.innerHTML = "";

  for (let i = 0; i < client.char_list_length; i++) {
    // Container wrapping the character icon and the favourite button
    const slot = document.createElement("div");
    slot.className = "char-slot";
    slot.dataset.charid = String(i);

    const demothing = document.createElement("img");
    demothing.className = "demothing";
    demothing.loading = "lazy";
    demothing.id = `demo_${i}`;
    demothing.dataset.action = "pickChar";
    demothing.dataset.char = String(i);

    const favBtn = document.createElement("button");
    favBtn.className = "fav-btn";
    favBtn.title = "Favourite";
    favBtn.dataset.action = "toggleFavourite";
    favBtn.textContent = "★";

    slot.appendChild(demothing);
    slot.appendChild(favBtn);
    document.getElementById("client_chartable")!.appendChild(slot);
  }

  applyFavourites();

  client.server.send.RC({});
};
