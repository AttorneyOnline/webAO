import { client } from "../client";
import { safeTags } from "../encoding";
import request from "../services/request";
import { AO_HOST } from "./aoHost";
import { parseCharIni } from "./CharIni";
import type { CharIni, IniSection } from "./CharIni";

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
    const iconExt = client.charicon_extensions[0] || ".png";
    img.src = `${AO_HOST}characters/${encodeURI(
      chargs[0].toLowerCase(),
    )}/char_icon${iconExt}`;

    const mute_select = <HTMLSelectElement>(
      document.getElementById("mute_select")
    );
    mute_select.add(new Option(safeTags(chargs[0]), String(charid)));
    const pair_select = <HTMLSelectElement>(
      document.getElementById("pair_select")
    );
    pair_select.add(new Option(safeTags(chargs[0]), String(charid)));

    // Store defaults — these get replaced with actual ini values by ensureCharIni
    const char: CharIni = {
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
    client.chars[charid] = char;
  } else {
    console.warn(`missing charid ${charid}`);
    img.style.display = "none";
  }
};

/**
 * Fetches and parses char.ini for a character if not already loaded.
 * Replaces default values in client.chars[charid] with actual ini values.
 * Returns the CharIni entry, or null if the character doesn't exist.
 */
export const ensureCharIni = async (charid: number): Promise<CharIni | null> => {
  const char = client.chars[charid];
  if (!char) return null;
  if (char.options) return char;

  const img = <HTMLImageElement>document.getElementById(`demo_${charid}`);
  let sections: Record<string, IniSection> = {};

  try {
    const cinidata = await request(
      `${AO_HOST}characters/${encodeURI(char.name.toLowerCase())}/char.ini`,
    );
    sections = parseCharIni(cinidata);
  } catch (err) {
    if (img) img.classList.add("noini");
    console.warn(`character ${char.name} is missing from webAO`);
  }

  // Apply defaults and store ini sections on char
  char.options = {
    name: char.name,
    showname: char.name,
    side: "def",
    blips: "male",
    chat: "",
    category: "",
    ...sections.options,
  };

  char.emotions = {
    number: "0",
    ...sections.emotions,
  };

  if (sections.soundn) char.soundn = sections.soundn;
  if (sections.soundt) char.soundt = sections.soundt;

  // Replace resolved fields with actual ini values
  char.showname = safeTags(char.options.showname);
  char.blips = safeTags(char.options.blips).toLowerCase();
  char.gender = safeTags(char.options.gender ?? "").toLowerCase();
  char.side = safeTags(char.options.side).toLowerCase();
  char.chat =
    char.options.chat === ""
      ? safeTags(char.options.category).toLowerCase()
      : safeTags(char.options.chat).toLowerCase();
  char.icon = img ? img.src : "";

  if (
    char.blips === "male" &&
    char.gender !== "male" &&
    char.gender !== ""
  ) {
    char.blips = char.gender;
  }

  return char;
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
    const iconExt = client.charicon_extensions[0] || ".png";
    img.src = `${AO_HOST}characters/${encodeURI(
      chargs[0].toLowerCase(),
    )}/char_icon${iconExt}`;

    // Reset ini sections so ensureCharIni will re-fetch
    if (client.chars[charid]) {
      client.chars[charid].name = safeTags(chargs[0]);
      delete client.chars[charid].options;
      delete client.chars[charid].emotions;
      delete client.chars[charid].soundn;
      delete client.chars[charid].soundt;
    } else {
      setupCharacterBasic(chargs, charid);
    }

    await ensureCharIni(charid);
  } else {
    console.warn(`missing charid ${charid}`);
    img.style.display = "none";
  }
};
