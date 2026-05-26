import { client } from "../client";

export const changeMusicVolume = (volume: number = -1) => {
  const clientVolume = Number(
    (<HTMLInputElement>document.getElementById("client_mvolume")).value,
  );
  const musicVolume = volume === -1 ? clientVolume : volume;
  client.viewport.music.forEach(
    (channel: HTMLAudioElement) => (channel.volume = musicVolume),
  );
  localStorage.setItem("musicVolume", String(musicVolume));
};
window.changeMusicVolume = changeMusicVolume;
