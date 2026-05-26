import { client, extrafeatures, oldLoading } from "../../client";
import { fetchExtensions } from "../../client/fetchLists";
import { applyFavourites } from "../../dom/toggleFavourite";

/**
 * Received when the server announces its server info,
 * but we use it as a cue to begin retrieving characters.
 * @param {Array} args packet arguments
 */
export const handleSI = (args: string[]) => {
  client.char_list_length = Number(args[1]);
  client.evidence_list_length = Number(args[2]);
  client.music_list_length = Number(args[3]);

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
    const demoonclick = document.createAttribute("onclick");
    demoonclick.value = `pickChar(${i})`;
    demothing.setAttributeNode(demoonclick);

    const favBtn = document.createElement("button");
    favBtn.className = "fav-btn";
    favBtn.title = "Favourite";
    favBtn.setAttribute("onclick", `toggleFavourite(${i}, event)`);
    favBtn.textContent = "★";

    slot.appendChild(demothing);
    slot.appendChild(favBtn);
    document.getElementById("client_chartable")!.appendChild(slot);
  }

  applyFavourites();

  // this is determined at the top of this file
  if (!oldLoading) {
    client.sender.sendServer("RC#%");
  } else {
    client.sender.sendServer("askchar2#%");
  }
};
