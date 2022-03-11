import setCookie from '../utils/setCookie';

/**
 * Triggered by the sound effect volume slider.
 */

export function changeSFXVolume() {
  setCookie('sfxVolume', document.getElementById('client_sfxaudio').volume);
}
window.changeSFXVolume = changeSFXVolume;
