import { client } from "../client";
import { AO_HOST } from "./aoHost";
import { request } from "../services/request.js";

export const fetchBackgroundList = async () => {
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
};

export const fetchCharacterList = async () => {
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
};

export const fetchEvidenceList = async () => {
  const evi_select = <HTMLSelectElement>document.getElementById("evi_select");
  evi_select.innerHTML = "";

  evi_select.add(new Option("Custom", "0"));

  try {
    const evidata = await request(`${AO_HOST}evidence.json`);
    const evi_array = JSON.parse(evidata);
    // the try catch will fail before here when there is no file

    evi_array.forEach((evi: string) => {
      evi_select.add(new Option(evi));
    });
  } catch (err) {
    console.warn("there was no evidence.json file");
  }
};

export const fetchManifest = async () => {
  try {
    const manifestdata = await request(`${AO_HOST}manifest.txt`);
    client.manifest = manifestdata.split(/\r\n|\n\r|\n|\r/);
    // the try catch will fail before here when there is no file
  } catch (err) {
    console.warn("there was no manifest.txt file");
  }
};
