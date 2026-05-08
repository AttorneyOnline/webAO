import vanilla_evidence_arr from "../constants/evidence.js";
import vanilla_background_arr from "../constants/backgrounds.js";
import { changeMusicVolume } from "../dom/changeMusicVolume";
import { setChatbox } from "../dom/setChatbox";
import {
  changeSFXVolume,
  changeShoutVolume,
  changeTestimonyVolume,
} from "../dom/changeVolume";
import { showname_click } from "../dom/showNameClick";
import { changeBlipVolume } from "../dom/changeBlipVolume";
import { reloadTheme } from "../dom/reloadTheme";
import { setFont } from "../dom/setFont";
import { restoreThemeMaker, restoreBlipPitch } from "../dom/themeMaker";
const version = process.env.npm_package_version;

/**
 * Load game resources and stored settings.
 */
export const loadResources = () => {
  document.getElementById("client_version")!.innerText = `version ${version}`;
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

  (<HTMLInputElement>document.getElementById("ic_chat_name")).value =
    localStorage.getItem("ic_chat_name");
  (<HTMLInputElement>document.getElementById("showname")).checked = Boolean(
    localStorage.getItem("showname"),
  );
  showname_click(null);

  (<HTMLInputElement>document.getElementById("client_callwords")).value =
    localStorage.getItem("callwords");

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
