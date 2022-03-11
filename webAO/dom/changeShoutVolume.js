import setCookie from '../utils/setCookie';

/**
 * Triggered by the shout volume slider.
 */

export function changeShoutVolume() {
  setCookie('shoutVolume', document.getElementById('client_shoutaudio').volume);
}
window.changeShoutVolume = changeShoutVolume;
