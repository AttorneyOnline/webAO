import { client } from "../client";
import { AO_HOST } from "./aoHost";
import { request } from "../services/request";

export async function fetchBackgroundList() {
  try {
    const bgdata = await request(`${AO_HOST}backgrounds.json`);
    const bg_array = JSON.parse(bgdata);
    // the try catch will fail before here when there is no file

    const bg_select = <HTMLSelectElement>document.getElementById("bg_select");
    bg_select.innerHTML = "";

    bg_select.add(new Option("Custom", "0"));
    bg_array.forEach((background: string) => {
      bg_select.add(new Option(background));
    });
  } catch (err) {
    console.warn("there was no backgrounds.json file");
  }
}

export async function fetchCharacterList() {
  const char_select = <HTMLSelectElement>(
    document.getElementById("client_iniselect")
  );
  char_select.innerHTML = "";

  char_select.add(new Option("Custom", "0"));

  try {
    const chardata = await request(`${AO_HOST}characters.json`);
    const char_array = JSON.parse(chardata);
    // the try catch will fail before here when there is no file

    char_array.forEach((character: string) => {
      char_select.add(new Option(character));
    });
  } catch (err) {
    console.warn("there was no characters.json file");
  }
}

export async function fetchEvidenceList() {
  const evi_select = <HTMLSelectElement>document.getElementById("evi_select");
  evi_select.innerHTML = "";

  evi_select.add(new Option("Custom", "0"));

  try {
    const evidata = await request(`${AO_HOST}evidence.json`);
    const evi_array = JSON.parse(evidata);
    evi_array.forEach((evi: string) => {
      evi_select.add(new Option(evi));
    });
  } catch (err) {
    console.warn("there was no evidence.json file");
  }
}

export async function fetchExtensions() {
  try {
    const extensiondata = await request(`${AO_HOST}extensions.json`);
    const allextensions = JSON.parse(extensiondata);
    client.charicon_extensions = allextensions.charicon_extensions || [".png", ".webp"];
    client.emote_extensions = allextensions.emote_extensions || [".gif", ".png", ".apng", ".webp", ".webp.static"];
    client.emotions_extensions = allextensions.emotions_extensions || [".png", ".webp"];
    client.background_extensions = allextensions.background_extensions || [".png", ".gif", ".webp", ".apng"];
    console.log("charicons "+client.charicon_extensions)
    console.log("emotes "+client.emote_extensions)
    console.log("emotions "+client.emotions_extensions)
    console.log("backgrounds "+client.background_extensions)
  } catch (err) {
    console.warn("there was no extensions.json file");
  }
}

import { applyFavourites } from "../dom/toggleFavourite";
import type * as aolib from "../aolib";

/**
 * SI: server announces its asset counts. We seed the char-select grid
 * with placeholder slots (filled in by SC / CI) and start the download
 * sequence by sending RC.
 */
export function applyServerCounts(packet: aolib.SIPacket) {
  client.char_list_length = packet.char_cnt;
  client.evidence_list_length = packet.evi_cnt;
  client.music_list_length = packet.mus_cnt;

  fetchExtensions();

  // Build the char-select grid; the character loader will fill icons in.
  document.getElementById("client_chartable")!.innerHTML = "";

  for (let i = 0; i < client.char_list_length; i++) {
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
}
