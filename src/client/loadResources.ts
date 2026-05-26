import vanilla_evidence_arr from "../constants/evidence";
import vanilla_background_arr from "../constants/backgrounds";
import { changeMusicVolume } from "../dom/changeMusicVolume";
import { setChatbox } from "../dom/setChatbox";
import {
  changeSFXVolume,
  changeShoutVolume,
  changeTestimonyVolume,
} from "../dom/changeVolume";
import { showname_click } from "../dom/showNameClick";
import { changeBlipVolume } from "../dom/changeBlipVolume";
import { unlockBlipAudio } from "../viewport/utils/blipAudio";
import { reloadTheme } from "../dom/reloadTheme";
import { setFont } from "../dom/setFont";
import { restoreThemeMaker, restoreBlipPitch } from "../dom/themeMaker";
import { isHideDesksEnabled } from "../dom/switchHideDesks";
import { isPanTiltEnabled, switchPanTilt } from "../dom/switchPanTilt";
import {
  isMusicMuted,
  isSfxMuted,
  isBlipMuted,
  applyMusicMute,
  applySfxMute,
  applyBlipMute,
} from "../dom/audioMute";
import { version } from "../version";

/**
 * Load game resources and stored settings.
 */
export const loadResources = () => {
  document.getElementById("client_version")!.innerText = `version ${version}`;
  (document.getElementById("mod_ui") as HTMLLinkElement).href = "styles/nomod.css";
  // Load background array to select
  const background_select = <HTMLSelectElement>(
    document.getElementById("bg_select")
  );
  background_select.add(new Option("Custom", "0"));
  vanilla_background_arr.forEach((background) => {
    background_select.add(new Option(background));
  });

  // Load evidence array to select
  const evidence_select = <HTMLSelectElement>(
    document.getElementById("evi_select")
  );
  evidence_select.add(new Option("Custom", "0"));
  vanilla_evidence_arr.forEach((evidence) => {
    evidence_select.add(new Option(evidence));
  });

  // Read local storage and set the UI to its values
  (<HTMLInputElement>document.getElementById("OOC_name")).value =
    localStorage.getItem("OOC_name") ||
    `web${String(Math.round(Math.random() * 100 + 10))}`;

  const storedTheme = localStorage.getItem("theme") || "default";

  // Restore theme maker before theme link so custom style takes precedence
  restoreThemeMaker();

  const themeOption = <HTMLOptionElement>(
    document.querySelector(`#client_themeselect [value="${storedTheme}"]`)
  );
  if (themeOption) themeOption.selected = true;
  reloadTheme();

  const storedChatbox = localStorage.getItem("chatbox") || "dynamic";

  (<HTMLOptionElement>(
    document.querySelector(`#client_chatboxselect [value="${storedChatbox}"]`)
  )).selected = true;
  setChatbox(storedChatbox);

  (<HTMLInputElement>document.getElementById("client_mvolume")).value =
    localStorage.getItem("musicVolume") || "1";
  changeMusicVolume();
  (<HTMLAudioElement>document.getElementById("client_sfxaudio")).volume =
    Number(localStorage.getItem("sfxVolume")) || 1;
  changeSFXVolume();
  (<HTMLAudioElement>document.getElementById("client_shoutaudio")).volume =
    Number(localStorage.getItem("shoutVolume")) || 1;
  changeShoutVolume();
  (<HTMLAudioElement>document.getElementById("client_testimonyaudio")).volume =
    Number(localStorage.getItem("testimonyVolume")) || 1;
  changeTestimonyVolume();
  (<HTMLInputElement>document.getElementById("client_bvolume")).value =
    localStorage.getItem("blipVolume") || "1";
  changeBlipVolume();
  restoreBlipPitch();

  // Restore mute states
  const musicMuted = isMusicMuted();
  (<HTMLInputElement>document.getElementById("client_mute_music")).checked = musicMuted;
  applyMusicMute(musicMuted);

  const sfxMuted = isSfxMuted();
  (<HTMLInputElement>document.getElementById("client_mute_sfx")).checked = sfxMuted;
  applySfxMute(sfxMuted);

  const blipMuted = isBlipMuted();
  (<HTMLInputElement>document.getElementById("client_mute_blips")).checked = blipMuted;
  applyBlipMute(blipMuted);

  // Resume the blip AudioContext on the first user gesture so blips fire
  // reliably from the first message (browser autoplay policy).
  const unlock = () => {
    unlockBlipAudio();
    document.removeEventListener("pointerdown", unlock);
    document.removeEventListener("keydown", unlock);
  };
  document.addEventListener("pointerdown", unlock, { once: true });
  document.addEventListener("keydown", unlock, { once: true });

  (<HTMLInputElement>document.getElementById("ic_chat_name")).value =
    localStorage.getItem("ic_chat_name");
  (<HTMLInputElement>document.getElementById("showname")).checked =
    localStorage.getItem("showname") !== "false";
  showname_click(null);

  (<HTMLInputElement>document.getElementById("client_callwords")).value =
    localStorage.getItem("callwords");

  // Restore pan-tilt setting (defaults to off)
  const panTiltCheckbox = <HTMLInputElement>document.getElementById("client_pantilt");
  if (panTiltCheckbox) {
    panTiltCheckbox.checked = isPanTiltEnabled();
    switchPanTilt();
  }

  // Restore hide-desks setting (defaults to off)
  const hideDesksCheckbox = <HTMLInputElement>document.getElementById("client_hidedesks");
  if (hideDesksCheckbox) {
    hideDesksCheckbox.checked = isHideDesksEnabled();
  }

  // Restore font setting
  const storedFont = localStorage.getItem("selectedFont") || "sans-serif";
  const fontSelect = <HTMLSelectElement>document.getElementById("client_fontselect");
  if (fontSelect) {
    const fontOption = <HTMLOptionElement>(
      fontSelect.querySelector(`[value="${storedFont}"]`)
    );
    if (fontOption) fontOption.selected = true;
    const customFontInput = <HTMLInputElement>document.getElementById("client_customfont");
    if (customFontInput) {
      customFontInput.value = localStorage.getItem("customFont") || "";
    }
    setFont();
  }
};
