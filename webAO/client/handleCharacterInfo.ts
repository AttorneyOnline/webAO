import { client } from "../client";
import { safeTags } from "../encoding";
import iniParse from "../iniParse";
import request from "../services/request";
import { AO_HOST } from "./aoHost";

/**
 * Lightweight character setup that runs on join. Sets the icon src directly
 * (letting the browser handle loading) and stores default character data.
 * Does NOT fetch char.ini — that is deferred until needed via ensureCharIni.
 */
export const setupCharacterBasic = (chargs: string[], charid: number) => {
  const img = <HTMLImageElement>document.getElementById(`demo_${charid}`);
  if (chargs[0]) {
    img.alt = chargs[0];
    img.title = chargs[0];
    img.src = `${AO_HOST}characters/${encodeURI(
      chargs[0].toLowerCase(),
    )}/char_icon.png`;

    const mute_select = <HTMLSelectElement>(
      document.getElementById("mute_select")
    );
    mute_select.add(new Option(safeTags(chargs[0]), String(charid)));
    const pair_select = <HTMLSelectElement>(
      document.getElementById("pair_select")
    );
    pair_select.add(new Option(safeTags(chargs[0]), String(charid)));

    // Store defaults — these get replaced with actual ini values by ensureCharIni
    client.chars[charid] = {
      name: safeTags(chargs[0]),
      showname: safeTags(chargs[0]),
      desc: safeTags(chargs[1]),
      blips: "male",
      gender: "",
      side: "def",
      chat: "",
      evidence: chargs[3],
      icon: "",
      muted: false,
    };
  } else {
    console.warn(`missing charid ${charid}`);
    img.style.display = "none";
  }
};

/**
 * Fetches and parses char.ini for a character if not already loaded.
 * Replaces default values in client.chars[charid] with actual ini values.
 */
export const ensureCharIni = async (charid: number): Promise<any> => {
  const char = client.chars[charid];
  if (!char) return {};
  if (char.inifile) return char.inifile;

  const img = <HTMLImageElement>document.getElementById(`demo_${charid}`);
  let cini: any = {};

  try {
    const cinidata = await request(
      `${AO_HOST}characters/${encodeURI(char.name.toLowerCase())}/char.ini`,
    );
    cini = iniParse(cinidata);
  } catch (err) {
    cini = {};
    if (img) img.classList.add("noini");
    console.warn(`character ${char.name} is missing from webAO`);
  }

  const default_options = {
    name: char.name,
    showname: char.name,
    side: "def",
    blips: "male",
    chat: "",
    category: "",
  };
  cini.options = Object.assign(default_options, cini.options);

  const default_emotions = {
    number: 0,
  };
  cini.emotions = Object.assign(default_emotions, cini.emotions);

  // Replace defaults with actual ini values
  char.showname = safeTags(cini.options.showname);
  char.blips = safeTags(cini.options.blips).toLowerCase();
  char.gender = safeTags(cini.options.gender).toLowerCase();
  char.side = safeTags(cini.options.side).toLowerCase();
  char.chat =
    cini.options.chat === ""
      ? safeTags(cini.options.category).toLowerCase()
      : safeTags(cini.options.chat).toLowerCase();
  char.icon = img ? img.src : "";
  char.inifile = cini;

  if (
    char.blips === "male" &&
    char.gender !== "male" &&
    char.gender !== ""
  ) {
    char.blips = char.gender;
  }

  return cini;
};

/**
 * Full character info load (used by iniEdit and handleMS ini-edit path).
 * Fetches icon + ini for a single character, replacing any existing data.
 */
export const handleCharacterInfo = async (chargs: string[], charid: number) => {
  const img = <HTMLImageElement>document.getElementById(`demo_${charid}`);
  if (chargs[0]) {
    img.alt = chargs[0];
    img.title = chargs[0];
    img.src = `${AO_HOST}characters/${encodeURI(
      chargs[0].toLowerCase(),
    )}/char_icon.png`;

    // Reset inifile so ensureCharIni will re-fetch
    if (client.chars[charid]) {
      client.chars[charid].name = safeTags(chargs[0]);
      client.chars[charid].inifile = null;
    } else {
      setupCharacterBasic(chargs, charid);
    }

    await ensureCharIni(charid);
  } else {
    console.warn(`missing charid ${charid}`);
    img.style.display = "none";
  }
};
