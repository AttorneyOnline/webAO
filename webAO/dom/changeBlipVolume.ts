import setCookie from "../utils/setCookie.js";
import { client } from '../client.js'
/**
 * Triggered by the blip volume slider.
 */
export const changeBlipVolume = () => {
    const blipVolume = (<HTMLInputElement>(
        document.getElementById("client_bvolume")
    )).value;
    client.viewport.blipChannels.forEach(
        (channel: HTMLAudioElement) => (channel.volume = Number(blipVolume))
    );
    setCookie("blipVolume", blipVolume);
}
// @ts-ignore
window.changeBlipVolume = changeBlipVolume;
