import { client, oldLoading } from "../client";
import { fetchExtensions } from "../client/fetchLists";
import { applyFavourites } from "../dom/toggleFavourite";
import type { PacketCodec } from "../packets";

export interface SIPacket {
  charCnt: number;
  eviCnt: number;
  musCnt: number;
}

export const SI: PacketCodec<SIPacket> = {
  decode(args) {
    return {
      charCnt: Number(args[1]),
      eviCnt: Number(args[2]),
      musCnt: Number(args[3]),
    };
  },
  encode(packet) {
    return `SI#${packet.charCnt}#${packet.eviCnt}#${packet.musCnt}#%`;
  },
};

/**
 * Received when the server announces its server info,
 * but we use it as a cue to begin retrieving characters.
 */
export const receiveSI = (packet: SIPacket) => {
  client.char_list_length = packet.charCnt;
  client.evidence_list_length = packet.eviCnt;
  client.music_list_length = packet.musCnt;

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
