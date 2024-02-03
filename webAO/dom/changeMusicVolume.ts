import { client } from '../client.js'
import setCookie from '../utils/setCookie.js';

export const changeMusicVolume = (volume: number = -1) => {
    const clientVolume = Number(
        (<HTMLInputElement>document.getElementById("client_mvolume")).value
    );
    const musicVolume = volume === -1 ? clientVolume : volume;
    client.viewport.music.forEach(
        (channel: HTMLAudioElement) => (channel.volume = musicVolume)
    );
    setCookie("musicVolume", String(musicVolume));
};
// @ts-ignore
window.changeMusicVolume = changeMusicVolume;