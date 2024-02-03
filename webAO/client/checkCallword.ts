import { client } from "../client.js";
import { AO_HOST } from "./aoHost.js";

/**
 * check if the message contains an entry on our callword list
 * @param {string} message
 */
export function checkCallword(message: string, sfxAudio: HTMLAudioElement) {
    client.callwords.forEach(testCallword);
    function testCallword(item: string) {
        if (item !== "" && message.toLowerCase().includes(item.toLowerCase())) {
            sfxAudio.pause();
            sfxAudio.src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
            sfxAudio.play();
        }
    }
}