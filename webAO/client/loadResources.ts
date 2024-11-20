import getCookie from "../utils/getCookie";
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

  // Read cookies and set the UI to its values
  (<HTMLInputElement>document.getElementById("OOC_name")).value =
    getCookie("OOC_name") ||
    `web${String(Math.round(Math.random() * 100 + 10))}`;

  // Read cookies and set the UI to its values
  const cookietheme = getCookie("theme") || "default";

  (<HTMLOptionElement>(
    document.querySelector(`#client_themeselect [value="${cookietheme}"]`)
  )).selected = true;
  reloadTheme();

  const cookiechatbox = getCookie("chatbox") || "dynamic";

  (<HTMLOptionElement>(
    document.querySelector(`#client_chatboxselect [value="${cookiechatbox}"]`)
  )).selected = true;
  setChatbox(cookiechatbox);

  (<HTMLInputElement>document.getElementById("client_mvolume")).value =
    getCookie("musicVolume") || "1";
  changeMusicVolume();
  (<HTMLAudioElement>document.getElementById("client_sfxaudio")).volume =
    Number(getCookie("sfxVolume")) || 1;
  changeSFXVolume();
  (<HTMLAudioElement>document.getElementById("client_shoutaudio")).volume =
    Number(getCookie("shoutVolume")) || 1;
  changeShoutVolume();
  (<HTMLAudioElement>document.getElementById("client_testimonyaudio")).volume =
    Number(getCookie("testimonyVolume")) || 1;
  changeTestimonyVolume();
  (<HTMLInputElement>document.getElementById("client_bvolume")).value =
    getCookie("blipVolume") || "1";
  changeBlipVolume();

  (<HTMLInputElement>document.getElementById("ic_chat_name")).value =
    getCookie("ic_chat_name");
  (<HTMLInputElement>document.getElementById("showname")).checked = Boolean(
    getCookie("showname"),
  );
  showname_click(null);

  (<HTMLInputElement>document.getElementById("client_callwords")).value =
    getCookie("callwords");
};
