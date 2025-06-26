import setCookie from "../utils/setCookie";

declare global {
  interface Window {
    changeSFXVolume: () => void;
    changeTestimonyVolume: () => void;
    changeShoutVolume: () => void;
  }
}

/**
 * Triggered by the sound effect volume slider.
 */
export function changeSFXVolume(): void {
  const sfxAudioElement = document.getElementById("client_sfxaudio") as HTMLAudioElement;
  if (sfxAudioElement) {
    setCookie("sfxVolume", sfxAudioElement.volume);
  }
}
if (typeof window.changeSFXVolume !== 'function') {
  window.changeSFXVolume = changeSFXVolume;
}

/**
 * Triggered by the testimony volume slider.
 */
export function changeTestimonyVolume(): void {
  const testimonyAudioElement = document.getElementById("client_testimonyaudio") as HTMLAudioElement;
  if (testimonyAudioElement) {
    setCookie(
      "testimonyVolume",
      testimonyAudioElement.volume
    );
  }
}
if (typeof window.changeTestimonyVolume !== 'function') {
  window.changeTestimonyVolume = changeTestimonyVolume;
}

/**
 * Triggered by the shout volume slider.
 */
export function changeShoutVolume(): void {
  const shoutAudioElement = document.getElementById("client_shoutaudio") as HTMLAudioElement;
  if (shoutAudioElement) {
    setCookie("shoutVolume", shoutAudioElement.volume);
  }
}
if (typeof window.changeShoutVolume !== 'function') {
  window.changeShoutVolume = changeShoutVolume;
}