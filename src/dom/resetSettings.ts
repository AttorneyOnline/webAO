import { changeMusicVolume } from "./changeMusicVolume";
import { setChatbox } from "./setChatbox";
import { changeSFXVolume } from "./changeVolume";
import { changeBlipVolume } from "./changeBlipVolume";
import { reloadTheme } from "./reloadTheme";
import { setFont } from "./setFont";
import { switchPanTilt } from "./switchPanTilt";
import { switchAspectRatio } from "./switchAspectRatio";
import { switchChatOffset } from "./switchChatOffset";
import { switchHideDesks } from "./switchHideDesks";
import { resetThemeMaker } from "./themeMaker";
import { showname_click } from "./showNameClick";
import { applyMusicMute, applySfxMute, applyBlipMute } from "./audioMute";

const SETTINGS_KEYS = [
  "theme",
  "customCSS",
  "chatbox",
  "musicVolume",
  "sfxVolume",
  "blipVolume",
  "callwords",
  "ic_chat_name",
  "showname",
  "selectedFont",
  "customFont",
  "themeMakerConfig",
  "hideDesks",
  "panTilt",
  "musicMuted",
  "sfxMuted",
  "blipMuted",
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

  // --- SFX volume (combined SFX/Shout/Testimony) ---
  const svolume = <HTMLInputElement>document.getElementById("client_svolume");
  if (svolume) {
    svolume.value = "1";
    changeSFXVolume();
  }

  // --- Blip volume ---
  const bvolume = <HTMLInputElement>document.getElementById("client_bvolume");
  if (bvolume) {
    bvolume.value = "1";
    changeBlipVolume();
  }

  // --- Mute toggles ---
  const muteMusic = <HTMLInputElement>document.getElementById("client_mute_music");
  if (muteMusic) {
    muteMusic.checked = false;
    applyMusicMute(false);
  }
  const muteSfx = <HTMLInputElement>document.getElementById("client_mute_sfx");
  if (muteSfx) {
    muteSfx.checked = false;
    applySfxMute(false);
  }
  const muteBlips = <HTMLInputElement>document.getElementById("client_mute_blips");
  if (muteBlips) {
    muteBlips.checked = false;
    applyBlipMute(false);
  }

  // --- Callwords ---
  const callwords = <HTMLTextAreaElement>document.getElementById("client_callwords");
  if (callwords) callwords.value = "";

  // --- Custom showname ---
  const icChatName = <HTMLInputElement>document.getElementById("ic_chat_name");
  if (icChatName) icChatName.value = "";
  const shownameCheckbox = <HTMLInputElement>document.getElementById("showname");
  if (shownameCheckbox) {
    shownameCheckbox.checked = true;
    showname_click(null);
  }

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

  // --- Hide desks ---
  const hidedesks = <HTMLInputElement>document.getElementById("client_hidedesks");
  if (hidedesks) {
    hidedesks.checked = false;
    switchHideDesks();
  }
}
