import {client} from "../client";
import {safeTags} from "../encoding";
import iniParse from "../iniParse";
import request from "../services/request";
import fileExists from "../utils/fileExists";
import {AO_HOST} from "./aoHost";


export const getCharIcon = async (charButtonDiv: HTMLDivElement, charname: string) => {
    const extensions = [".png", ".webp"];
    charButtonDiv.style.backgroundImage = "none";
    // encodeURI doesn't encode parentheses, so we have to do it manually
    // This is required because CSS url() doesn't like unencoded parentheses
    const encodedCharname = encodeURI(charname.toLowerCase()).replace(/\(/g, '%28').replace(/\)/g, '%29');
    const charIconBaseUrl = `${AO_HOST}characters/${encodedCharname}/char_icon`;
    for (const extension of extensions) {
        const fileUrl = charIconBaseUrl + extension;
        const exists = await fileExists(fileUrl);
        if (exists) {
            charButtonDiv.style.backgroundImage = `url(${fileUrl})`;
            charButtonDiv.textContent = "";
            return;
        }
    }
    console.warn(`missing char icon for ${charname}`);
};

/**
 * Handles the incoming character information, and downloads the sprite + ini for it
 * @param {Array} chargs packet arguments
 * @param {Number} charid character ID
 */
export const handleCharacterInfo = async (chargs: string[], charid: number) => {
    const charButtonDiv = <HTMLDivElement>document.getElementById(`demo_${charid}`);
    if (!chargs[0]) {
        console.warn(`missing charid ${charid}`);
        charButtonDiv.style.display = "none";
        return;
    }

    const charName: string = chargs[0];
    let cini: any = {};

    getCharIcon(charButtonDiv, charName);

    // If the ini doesn't exist on the server this will throw an error
    try {
        const cinidata = await request(
            `${AO_HOST}characters/${encodeURI(charName.toLowerCase())}/char.ini`
        );
        cini = iniParse(cinidata);
    } catch (err) {
        cini = {};
        charButtonDiv.classList.add("noini");
        console.warn(`character ${charName} is missing from webAO`);
        // If it does, give the user a visual indication that the character is unusable
    }

    const mute_select = <HTMLSelectElement>(
        document.getElementById("mute_select")
    );
    mute_select.add(new Option(safeTags(charName), String(charid)));
    const pair_select = <HTMLSelectElement>(
        document.getElementById("pair_select")
    );
    pair_select.add(new Option(safeTags(charName), String(charid)));

    // sometimes ini files lack important settings
    const default_options = {
        name: charName,
        showname: charName,
        side: "def",
        blips: "male",
        chat: "",
        category: "",
    };
    cini.options = Object.assign(default_options, cini.options);

    // sometimes ini files lack even more important settings
    const default_emotions = {
        number: 0,
    };
    cini.emotions = Object.assign(default_emotions, cini.emotions);

    const charData = client.chars.get(charid);

    if (!charData) {
        console.warn(`missing initial charData for ${charid}`);
        charButtonDiv.style.display = "none";
        return;
    }

    charData.showname = safeTags(cini.options.showname);
    charData.blips = safeTags(cini.options.blips).toLowerCase();
    charData.gender = safeTags(cini.options.gender).toLowerCase();
    charData.side = safeTags(cini.options.side).toLowerCase();
    charData.chat =
        cini.options.chat === ""
            ? safeTags(cini.options.category).toLowerCase()
            : safeTags(cini.options.chat).toLowerCase();
    //charData.icon = charButtonDiv.src;
    charData.inifile = cini;
    charData.muted = false;

    if (
        client.chars.get(charid).blips === "male" &&
        client.chars.get(charid).gender !== "male" &&
        client.chars.get(charid).gender !== ""
    ) {
        client.chars.get(charid).blips = client.chars.get(charid).gender;
    }
}
