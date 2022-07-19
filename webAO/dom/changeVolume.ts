import setCookie from "../utils/setCookie";

/**
 * Triggered by the sound effect volume slider.
 */

export function changeSFXVolume() {
  const audioElement = document.getElementById(
    "client_sfxaudio"
  ) as HTMLAudioElement;
  setCookie("sfxVolume", String(audioElement.volume));
}
window.changeSFXVolume = changeSFXVolume;

/**
 * Triggered by the testimony volume slider.
 */
export function changeTestimonyVolume() {
  const audioElement = document.getElementById(
    "client_testimonyaudio"
  ) as HTMLAudioElement;

  setCookie("testimonyVolume", String(audioElement.volume));
}
window.changeTestimonyVolume = changeTestimonyVolume;

/**
 * Triggered by the shout volume slider.
 */

export function changeShoutVolume() {
  const audioElement = document.getElementById(
    "client_shoutaudio"
  ) as HTMLAudioElement;
  setCookie("shoutVolume", String(audioElement.volume));
}
window.changeShoutVolume = changeShoutVolume;
