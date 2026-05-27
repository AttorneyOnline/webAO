import { setBlipVolume } from "../viewport/utils/blipAudio";
/**
 * Triggered by the blip volume slider.
 */
export const changeBlipVolume = () => {
  const blipVolume = (<HTMLInputElement>(
    document.getElementById("client_bvolume")
  )).value;
  setBlipVolume(Number(blipVolume));
  localStorage.setItem("blipVolume", blipVolume);
};
