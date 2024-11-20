import { client } from "../client";
import { safeTags } from "../encoding";
import iniParse from "../iniParse";
import request from "../services/request";
import fileExists from "../utils/fileExists";
import { AO_HOST } from "./aoHost";

export const getCharIcon = async (img: HTMLImageElement, charname: string) => {
  const extensions = [".png", ".webp"];
  img.alt = charname;
  const charIconBaseUrl = `${AO_HOST}characters/${encodeURI(
    charname.toLowerCase(),
  )}/char_icon`;
  for (let i = 0; i < extensions.length; i++) {
    const fileUrl = charIconBaseUrl + extensions[i];
    const exists = await fileExists(fileUrl);
    if (exists) {
      img.alt = charname;
      img.title = charname;
      img.src = fileUrl;
      return;
    }
  }
};

/**
 * Handles the incoming character information, and downloads the sprite + ini for it
 * @param {Array} chargs packet arguments
 * @param {Number} charid character ID
 */
export const handleCharacterInfo = async (chargs: string[], charid: number) => {
  const img = <HTMLImageElement>document.getElementById(`demo_${charid}`);
  if (chargs[0]) {
    let cini: any = {};

    getCharIcon(img, chargs[0]);

    // If the ini doesn't exist on the server this will throw an error
    try {
      const cinidata = await request(
        `${AO_HOST}characters/${encodeURI(chargs[0].toLowerCase())}/char.ini`,
      );
      cini = iniParse(cinidata);
    } catch (err) {
      cini = {};
      img.classList.add("noini");
      console.warn(`character ${chargs[0]} is missing from webAO`);
      // If it does, give the user a visual indication that the character is unusable
    }

    const mute_select = <HTMLSelectElement>(
      document.getElementById("mute_select")
    );
    mute_select.add(new Option(safeTags(chargs[0]), String(charid)));
    const pair_select = <HTMLSelectElement>(
      document.getElementById("pair_select")
    );
    pair_select.add(new Option(safeTags(chargs[0]), String(charid)));

    // sometimes ini files lack important settings
    const default_options = {
      name: chargs[0],
      showname: chargs[0],
      side: "def",
      blips: "male",
      chat: "",
      category: "",
    };
    cini.options = Object.assign(default_options, cini.options);

    // sometimes ini files lack important settings
    const default_emotions = {
      number: 0,
    };
    cini.emotions = Object.assign(default_emotions, cini.emotions);

    client.chars[charid] = {
      name: safeTags(chargs[0]),
      showname: safeTags(cini.options.showname),
      desc: safeTags(chargs[1]),
      blips: safeTags(cini.options.blips).toLowerCase(),
      gender: safeTags(cini.options.gender).toLowerCase(),
      side: safeTags(cini.options.side).toLowerCase(),
      chat:
        cini.options.chat === ""
          ? safeTags(cini.options.category).toLowerCase()
          : safeTags(cini.options.chat).toLowerCase(),
      evidence: chargs[3],
      icon: img.src,
      inifile: cini,
      muted: false,
    };

    if (
      client.chars[charid].blips === "male" &&
      client.chars[charid].gender !== "male" &&
      client.chars[charid].gender !== ""
    ) {
      client.chars[charid].blips = client.chars[charid].gender;
    }
  } else {
    console.warn(`missing charid ${charid}`);
    img.style.display = "none";
  }
};
