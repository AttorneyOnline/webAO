/**
 * DOM -> TS dispatch via `data-action` attributes.
 *
 * HTML elements declare their handler with `data-action="<name>"`. The
 * default event is "click"; override with `data-event="change"` etc.
 * Args are read from element-specific data attributes by the action
 * itself (e.g. `data-shout="1"` for `toggleShout`).
 *
 *   <button data-action="addHPP">+</button>
 *   <button data-action="toggleShout" data-shout="1">!</button>
 *   <input data-action="onICEnter" data-event="keypress">
 *
 * One delegated listener per event type, registered in capture phase so
 * non-bubbling events (`error`, `volumechange`) work the same way.
 */
import { client } from "../client";

import { addEvidence } from "./addEvidence";
import { applyCustomFont, setFont } from "./setFont";
import { toggleMuteMusic, toggleMuteSfx, toggleMuteBlips } from "./audioMute";
import { callMod } from "./callMod";
import { cancelEvidence } from "./cancelEvidence";
import { changeBackgroundOOC } from "./changeBackgroundOOC";
import { changeBlipVolume } from "./changeBlipVolume";
import { changeCallwords } from "./changeCallwords";
import { changeCharacter } from "./changeCharacter";
import { changeMusicVolume } from "./changeMusicVolume";
import { changeRoleOOC } from "./changeRoleOOC";
import { changeSFXVolume } from "./changeVolume";
import { charError } from "./charError";
import { chartable_filter } from "./charTableFilter";
import { deleteEvidence } from "./deleteEvidence";
import { DisconnectButton } from "./disconnectButton";
import { editEvidence } from "./editEvidence";
import { exportLog } from "./exportLog";
import { imgError } from "./imgError";
import { iniedit } from "./iniEdit";
import { modcall_test } from "./modCallTest";
import { musiclist_click } from "./musicListClick";
import { musiclist_filter } from "./musicListFilter";
import { mutelist_click } from "./muteListClick";
import { onICEnter } from "./onICEnter";
import { onOOCEnter } from "./onOOCEnter";
import { onReplayGo } from "./onReplayGo";
import { opusCheck } from "./opusCheck";
import { pickChar } from "./pickChar";
import { randomCharacterOOC } from "./randomCharacterOOC";
import { ReconnectButton } from "./reconnectButton";
import { reloadTheme, importCustomCSS } from "./reloadTheme";
import { resetSettings } from "./resetSettings";
import { setChatbox } from "./setChatbox";
import { showname_click } from "./showNameClick";
import { switchAspectRatio } from "./switchAspectRatio";
import { switchChatOffset } from "./switchChatOffset";
import { switchHideDesks } from "./switchHideDesks";
import { switchPanTilt } from "./switchPanTilt";
import { openThemeMaker } from "./themeMaker";
import { toggleEffect } from "./toggleEffect";
import { toggleFavourite } from "./toggleFavourite";
import { toggleElement } from "./toggleElement";
import { toggleMenu } from "./toggleMenu";
import { toggleShout } from "./toggleShout";
import { toggleVoice } from "./toggleVoice";
import { updateBackgroundPreview } from "./updateBackgroundPreview";
import { updateEvidenceIcon } from "./updateEvidenceIcon";
import { updateIniswap } from "./updateIniswap";
import { ShoutModifier } from "../packets/MS";

const datasetOf = (e: Event) => (e.currentTarget as HTMLElement).dataset;

const actions: Record<string, (e: Event) => void> = {
  // Trivial inline handlers.
  guilty: () => client.server.send.RT({ animation: "judgeruling", judgeId: 1 }),
  notguilty: () => client.server.send.RT({ animation: "judgeruling", judgeId: 0 }),
  initCE: () => client.server.send.RT({ animation: "testimony2" }),
  initWT: () => client.server.send.RT({ animation: "testimony1" }),
  redHPD: () => client.server.send.HP({ bar: 1, value: client.hp[0] - 1 }),
  addHPD: () => client.server.send.HP({ bar: 1, value: client.hp[0] + 1 }),
  redHPP: () => client.server.send.HP({ bar: 2, value: client.hp[1] - 1 }),
  addHPP: () => client.server.send.HP({ bar: 2, value: client.hp[1] + 1 }),
  resetOffset: () => {
    (<HTMLInputElement>document.getElementById("pair_offset")).value = "0";
    (<HTMLInputElement>document.getElementById("pair_y_offset")).value = "0";
  },
  preventDefault: (e) => e.preventDefault(),

  // No-arg actions.
  addEvidence: () => addEvidence(),
  applyCustomFont: () => applyCustomFont(),
  callMod: () => callMod(),
  cancelEvidence: () => cancelEvidence(),
  changeBackgroundOOC: () => changeBackgroundOOC(),
  changeBlipVolume: () => changeBlipVolume(),
  changeCallwords: () => changeCallwords(),
  changeCharacter: (e) => changeCharacter(e),
  changeMusicVolume: () => changeMusicVolume(),
  changeRoleOOC: () => changeRoleOOC(),
  changeSFXVolume: () => changeSFXVolume(),
  deleteEvidence: () => deleteEvidence(),
  DisconnectButton: () => DisconnectButton(),
  editEvidence: () => editEvidence(),
  iniedit: () => iniedit(),
  modcall_test: () => modcall_test(),
  openThemeMaker: () => openThemeMaker(),
  randomCharacterOOC: () => randomCharacterOOC(),
  ReconnectButton: () => ReconnectButton(),
  reloadTheme: () => reloadTheme(),
  resetSettings: () => resetSettings(),
  setFont: () => setFont(),
  showname_click: (e) => showname_click(e),
  switchAspectRatio: () => switchAspectRatio(),
  switchChatOffset: () => switchChatOffset(),
  switchHideDesks: () => switchHideDesks(),
  switchPanTilt: () => switchPanTilt(),
  toggleMuteBlips: () => toggleMuteBlips(),
  toggleMuteMusic: () => toggleMuteMusic(),
  toggleMuteSfx: () => toggleMuteSfx(),
  toggleVoice: () => toggleVoice(),
  updateBackgroundPreview: () => updateBackgroundPreview(),
  updateEvidenceIcon: () => updateEvidenceIcon(),
  updateIniswap: () => updateIniswap(),

  // Event-taking actions.
  chartable_filter: (e) => chartable_filter(e),
  importCustomCSS: (e) => importCustomCSS(e),
  musiclist_click: (e) => musiclist_click(e),
  musiclist_filter: (e) => musiclist_filter(e),
  mutelist_click: (e) => mutelist_click(e),
  onICEnter: (e) => onICEnter(e as KeyboardEvent),
  onOOCEnter: (e) => onOOCEnter(e as KeyboardEvent),
  onReplayGo: (e) => onReplayGo(e),

  // Element/dataset-reading actions.
  imgError: (e) => imgError(e.currentTarget as HTMLImageElement),
  charError: (e) => charError(e.currentTarget as HTMLImageElement),
  opusCheck: (e) => opusCheck(e.currentTarget as HTMLAudioElement),
  toggleEffect: (e) => toggleEffect(e.currentTarget as HTMLElement),
  setChatbox: (e) => setChatbox((e.currentTarget as HTMLSelectElement).value),
  pickChar: (e) => pickChar(Number(datasetOf(e).char)),
  toggleShout: (e) => toggleShout(Number(datasetOf(e).shout) as ShoutModifier),
  toggleMenu: (e) => toggleMenu(Number(datasetOf(e).menu)),
  toggleElement: (e) => toggleElement(datasetOf(e).element!),
  exportLog: (e) => exportLog(datasetOf(e).format!),
  toggleFavourite: (e) => {
    const slot = (e.currentTarget as HTMLElement).closest<HTMLElement>(".char-slot");
    if (slot) toggleFavourite(Number(slot.dataset.charid), e);
  },
};

const EVENT_TYPES = [
  "click",
  "change",
  "input",
  "keypress",
  "submit",
  "error",
  "volumechange",
] as const;

for (const type of EVENT_TYPES) {
  document.addEventListener(
    type,
    (e) => {
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== "function") return;
      const el = target.closest<HTMLElement>("[data-action]");
      if (!el) return;
      const wantEvent = el.dataset.event ?? "click";
      if (wantEvent !== type) return;
      const action = el.dataset.action!;
      const fn = actions[action];
      if (!fn) {
        console.warn(`Unknown data-action: ${action}`);
        return;
      }
      // Ensure currentTarget reads point at the element with data-action,
      // even when the event fired on a descendant (closest matched up).
      Object.defineProperty(e, "currentTarget", { value: el, configurable: true });
      fn(e);
    },
    true, // capture phase: catches non-bubbling events too
  );
}
