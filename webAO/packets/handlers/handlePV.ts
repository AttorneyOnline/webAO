import { client } from "../../client";
import fileExists from "../../utils/fileExists";
import { updateActionCommands } from '../../dom/updateActionCommands'
import { pickEmotion } from '../../dom/pickEmotion'
import { AO_HOST } from "../../client/aoHost";

function addEmoteButton(i: number, imgurl: string, desc: string) {
    const emotesList = document.getElementById("client_emo");
    const emote_item = new Image();
    emote_item.id = "emo_" + i;
    emote_item.className = "emote_button";
    emote_item.src = imgurl;
    emote_item.alt = desc;
    emote_item.title = desc;
    emote_item.onclick = () => { window.pickEmotion(i) }
    emotesList.appendChild(emote_item);
}


/**
 * Handles the server's assignment of a character for the player to use.
 * PV # playerID (unused) # CID # character ID
 * @param {Array} args packet arguments
 */
export const handlePV = async (args: string[]) => {
    client.charID = Number(args[3]);
    document.getElementById("client_waiting")!.style.display = "none";
    document.getElementById("client_charselect")!.style.display = "none";

    const me = client.chars[client.charID];
    client.selectedEmote = -1;
    const { emotes } = client;
    const emotesList = document.getElementById("client_emo");
    emotesList.style.display = "";
    emotesList.innerHTML = ""; // Clear emote box
    const ini = me.inifile;
    me.side = ini.options.side;
    updateActionCommands(me.side);
    if (ini.emotions.number === 0) {
        emotesList.innerHTML = `<span
					id="emo_0"
					alt="unavailable"
					class="emote_button">No emotes available</span>`;
    } else {
        for (let i = 1; i <= ini.emotions.number; i++) {
            try {
                const emoteinfo = ini.emotions[i].split("#");
                let esfx;
                let esfxd;
                try {
                    esfx = ini.soundn[i] || "0";
                    esfxd = Number(ini.soundt[i]) || 0;
                } catch (e) {
                    console.warn("ini sound is completly missing");
                    esfx = "0";
                    esfxd = 0;
                }
                // Make sure the asset server is case insensitive, or that everything on it is lowercase

                const extensionsMap = [".png", ".webp"];
                let url;
                for (const extension of extensionsMap) {
                    url = `${AO_HOST}characters/${encodeURI(
                        me.name.toLowerCase()
                    )}/emotions/button${i}_off${extension}`;

                    const exists = await fileExists(url);

                    if (exists) {
                        break;
                    }
                }

                emotes[i] = {
                    desc: emoteinfo[0].toLowerCase(),
                    preanim: emoteinfo[1].toLowerCase(),
                    emote: emoteinfo[2].toLowerCase(),
                    zoom: Number(emoteinfo[3]) || 0,
                    deskmod: Number(emoteinfo[4]) || 1,
                    sfx: esfx.toLowerCase(),
                    sfxdelay: esfxd,
                    frame_screenshake: "",
                    frame_realization: "",
                    frame_sfx: "",
                    button: url,
                };

                addEmoteButton(i, url, emotes[i].desc);

                if (i === 1) pickEmotion(1);
            } catch (e) {
                console.error(`missing emote ${i}`);
            }
        }
    }

    if (
        await fileExists(
            `${AO_HOST}characters/${encodeURI(me.name.toLowerCase())}/custom.gif`
        )
    ) {
        document.getElementById("button_4")!.style.display = "";
    } else {
        document.getElementById("button_4")!.style.display = "none";
    }
}