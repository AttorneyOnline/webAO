import { changeMusicVolume } from "./changeMusicVolume";
import { setChatbox } from "./setChatbox";
import {
  changeSFXVolume,
  changeShoutVolume,
  changeTestimonyVolume,
} from "./changeVolume";
import { changeBlipVolume } from "./changeBlipVolume";
import { reloadTheme } from "./reloadTheme";
import { setFont } from "./setFont";
import { switchPanTilt } from "./switchPanTilt";
import { switchAspectRatio } from "./switchAspectRatio";
import { switchChatOffset } from "./switchChatOffset";
import { resetThemeMaker } from "./themeMaker";

const SETTINGS_KEYS = [
  "theme",
  "customCSS",
  "chatbox",
  "musicVolume",
  "sfxVolume",
  "shoutVolume",
  "testimonyVolume",
  "blipVolume",
  "callwords",
  "ic_chat_name",
  "showname",
  "selectedFont",
  "customFont",
  "themeMakerConfig",
];

/**
 * Resets all client settings to their defaults and clears them from localStorage.
 */
export function resetSettings() {
  if (!confirm("Reset all settings to defaults? This cannot be undone.")) return;

  // Clear all stored settings
  SETTINGS_KEYS.forEach((key) => localStorage.removeItem(key));

  // --- Theme Maker ---
  resetThemeMaker();

  // --- Theme ---
  const themeSelect = <HTMLSelectElement>document.getElementById("client_themeselect");
  if (themeSelect) {
    themeSelect.value = "default";
    reloadTheme();
    // Remove any injected custom style
    const customStyle = document.getElementById("client_custom_style");
    if (customStyle) customStyle.remove();
    // Hide custom CSS row
    const customCSSRow = document.getElementById("client_customcss_row");
    if (customCSSRow) customCSSRow.style.display = "none";
  }

  // --- Chatbox ---
  const chatboxSelect = <HTMLSelectElement>document.getElementById("client_chatboxselect");
  if (chatboxSelect) {
    chatboxSelect.value = "dynamic";
    setChatbox("dynamic");
  }

  // --- Font ---
  const fontSelect = <HTMLSelectElement>document.getElementById("client_fontselect");
  if (fontSelect) {
    fontSelect.value = "sans-serif";
    const customFontInput = <HTMLInputElement>document.getElementById("client_customfont");
    if (customFontInput) customFontInput.value = "";
    setFont();
  }

  // --- Music volume ---
  const mvolume = <HTMLInputElement>document.getElementById("client_mvolume");
  if (mvolume) {
    mvolume.value = "1";
    changeMusicVolume();
  }

  // --- SFX volume ---
  const sfxAudio = <HTMLAudioElement>document.getElementById("client_sfxaudio");
  if (sfxAudio) {
    sfxAudio.volume = 1;
    changeSFXVolume();
  }

  // --- Shout volume ---
  const shoutAudio = <HTMLAudioElement>document.getElementById("client_shoutaudio");
  if (shoutAudio) {
    shoutAudio.volume = 1;
    changeShoutVolume();
  }

  // --- Testimony volume ---
  const testimonyAudio = <HTMLAudioElement>document.getElementById("client_testimonyaudio");
  if (testimonyAudio) {
    testimonyAudio.volume = 1;
    changeTestimonyVolume();
  }

  // --- Blip volume ---
  const bvolume = <HTMLInputElement>document.getElementById("client_bvolume");
  if (bvolume) {
    bvolume.value = "1";
    changeBlipVolume();
  }

  // --- Callwords ---
  const callwords = <HTMLTextAreaElement>document.getElementById("client_callwords");
  if (callwords) callwords.value = "";

  // --- Custom showname ---
  const icChatName = <HTMLInputElement>document.getElementById("ic_chat_name");
  if (icChatName) icChatName.value = "";

  // --- Pan-tilt ---
  const pantilt = <HTMLInputElement>document.getElementById("client_pantilt");
  if (pantilt && pantilt.checked) {
    pantilt.checked = false;
    switchPanTilt();
  }

  // --- 16:9 viewport ---
  const hdviewport = <HTMLInputElement>document.getElementById("client_hdviewport");
  const hdOffset = <HTMLInputElement>document.getElementById("client_hdviewport_offset");
  if (hdviewport && hdviewport.checked) {
    hdviewport.checked = false;
    switchAspectRatio();
  }
  if (hdOffset) {
    hdOffset.checked = false;
    switchChatOffset();
  }
}
window.resetSettings = resetSettings;
