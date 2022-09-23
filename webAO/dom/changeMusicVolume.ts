import { client } from '../client'
import setCookie from '../utils/setCookie';

export const changeMusicVolume = (volume: number = -1) => {
    const clientVolume = Number(
        (<HTMLInputElement>document.getElementById("client_mvolume")).value
    );
    let musicVolume = volume === -1 ? clientVolume : volume;
    client.viewport.music.forEach(
        (channel: HTMLAudioElement) => (channel.volume = musicVolume)
    );
    setCookie("musicVolume", String(musicVolume));
};
window.changeMusicVolume = changeMusicVolume;