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
        charname.toLowerCase()
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
                `${AO_HOST}characters/${encodeURI(chargs[0].toLowerCase())}/char.ini`
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

        const charData = client.chars.get(charid);

        if (!charData) {
            console.warn(`missing initial charData for ${charid}`);
            img.style.display = "none";
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
        charData.icon = img.src;
        charData.inifile = cini;
        charData.muted = false;

        if (
            client.chars.get(charid).blips === "male" &&
            client.chars.get(charid).gender !== "male" &&
            client.chars.get(charid).gender !== ""
        ) {
            client.chars.get(charid).blips = client.chars.get(charid).gender;
        }

    } else {
        console.warn(`missing charid ${charid}`);
        img.style.display = "none";
    }
}
