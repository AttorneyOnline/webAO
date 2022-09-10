import setCookie from "../utils/setCookie";
import { client } from '../client'
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
window.changeBlipVolume = changeBlipVolume;
