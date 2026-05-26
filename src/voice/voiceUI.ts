import {
  isVoiceAvailable,
  isPTTOnly,
  isInVoice,
  joinVoice,
  joinVoiceListenOnly,
  isListenOnly,
  leaveVoice,
  setPTT,
  onCapsChange,
  onSpeakingChange,
  getSpeakingLabels,
  getSpeakingUids,
  isLocalSpeaking,
  isLocalOpenMic,
  setLocalOpenMic,
  getLocalPlayerID,
  getSpeakerDisplayName,
  setInputDevice,
  getInputDeviceId,
  setOutputVolume,
  getOutputVolume,
  isVCMuted,
  setVCMuted,
} from "./voice";

let installed = false;
let menuButton: HTMLElement | null = null;
let menuIcon: HTMLElement | null = null;
let menuText: HTMLElement | null = null;
let settingsFieldset: HTMLFieldSetElement | null = null;
let settingsToggleButton: HTMLButtonElement | null = null;
let settingsStatusLine: HTMLElement | null = null;
let settingsSpeakingList: HTMLElement | null = null;
let deviceSelect: HTMLSelectElement | null = null;
let outputVolumeSlider: HTMLInputElement | null = null;
let pttControls: HTMLElement | null = null;
let tapButton: HTMLButtonElement | null = null;
let openMicRow: HTMLElement | null = null;
let openMicCheck: HTMLInputElement | null = null;
let vcMuteButton: HTMLButtonElement | null = null;
let speakerOverlay: HTMLElement | null = null;
let tapActive = false;
let toggleInFlight = false;
let deviceListPopulated = false;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

function render() {
  const available = isVoiceAvailable();

  if (menuButton) {
    menuButton.style.display = available ? "" : "none";
  }
  if (openMicRow) {
    openMicRow.style.display = available ? "" : "none";
  }
  if (settingsFieldset) {
    settingsFieldset.style.display = available ? "" : "none";
  }

  if (!available) return;

  const joined = isInVoice();
  const listenOnlyMode = isListenOnly();
  const micActive = joined && !listenOnlyMode;
  const ptt = isPTTOnly();
  const openMic = isLocalOpenMic();
  const muted = isVCMuted();

  if (openMicCheck) {
    openMicCheck.checked = openMic;
  }

  if (menuIcon) {
    menuIcon.innerHTML = micActive ? "&#127908;" : "&#128266;";
  }
  if (menuText) {
    menuText.textContent = micActive ? "Mic On" : "Voice";
    (menuText as HTMLElement).style.color = micActive ? "#5cb85c" : "";
  }
  if (menuButton) {
    menuButton.setAttribute(
      "title",
      micActive
        ? ptt
          ? "Mic on — hold V or tap Tap to Talk. Click to disconnect mic."
          : "Mic on (open mic). Click to disconnect mic."
        : "Click to enable microphone for voice chat",
    );
  }

  if (vcMuteButton) {
    vcMuteButton.textContent = muted ? "&#128263; Unmute VC Audio" : "&#128264; Mute VC Audio";
    vcMuteButton.innerHTML = muted ? "&#128263; Unmute VC Audio" : "&#128264; Mute VC Audio";
    vcMuteButton.style.background = muted ? "#8b2020" : "";
    vcMuteButton.style.color = muted ? "#fff" : "";
  }

  if (settingsToggleButton) {
    settingsToggleButton.textContent = micActive ? "Disconnect Microphone" : "Enable Microphone";
  }
  if (settingsStatusLine) {
    if (micActive) {
      settingsStatusLine.textContent = ptt
        ? "Mic connected — use Tap to Talk or hold V"
        : "Mic connected — open mic";
    } else if (joined) {
      settingsStatusLine.textContent = muted
        ? "Listening (VC audio muted)"
        : "Listening — enable microphone to talk";
    } else {
      settingsStatusLine.textContent = "Joining voice…";
    }
  }

  // Show tap-to-talk when mic is on, server requires PTT, and open mic override is off
  if (pttControls) {
    pttControls.style.display = micActive && ptt && !openMic ? "" : "none";
  }
  if (tapButton) {
    if (tapActive) {
      tapButton.textContent = "🔴 Stop Talking";
      tapButton.style.background = "#8b2020";
      tapButton.style.color = "#fff";
    } else {
      tapButton.textContent = "🎙️ Tap to Talk";
      tapButton.style.background = "";
      tapButton.style.color = "";
    }
  }

  if (settingsSpeakingList) {
    const labels = getSpeakingLabels();
    settingsSpeakingList.textContent =
      labels.length === 0
        ? "🔊 Speaking: (nobody)"
        : `🔊 Speaking: ${labels.join(", ")}`;
  }

  updatePlayerListSpeaking();
  renderSpeakerOverlay();
}

function renderSpeakerOverlay() {
  if (!speakerOverlay) return;

  const localUID = getLocalPlayerID();
  const localTalking = isLocalSpeaking();
  const remoteUids = getSpeakingUids();

  type Entry = { uid: number; label: string; isSelf: boolean };
  const entries: Entry[] = [];
  if (localTalking && localUID >= 0) {
    entries.push({
      uid: localUID,
      label: getSpeakerDisplayName(localUID),
      isSelf: true,
    });
  }
  for (let i = 0; i < remoteUids.length; i++) {
    const uid = remoteUids[i];
    entries.push({
      uid,
      label: getSpeakerDisplayName(uid),
      isSelf: false,
    });
  }

  const desiredKeys = entries.map((e) => `${e.isSelf ? "s" : "r"}:${e.uid}`);
  const existingKeys: string[] = [];
  const children = speakerOverlay.children;
  for (let i = 0; i < children.length; i++) {
    const key = (children[i] as HTMLElement).dataset.key;
    if (key) existingKeys.push(key);
  }

  let unchanged = desiredKeys.length === existingKeys.length;
  if (unchanged) {
    for (let i = 0; i < desiredKeys.length; i++) {
      if (desiredKeys[i] !== existingKeys[i]) {
        unchanged = false;
        break;
      }
    }
  }

  if (unchanged) {
    for (let i = 0; i < entries.length; i++) {
      const nameEl = (children[i] as HTMLElement).querySelector<HTMLElement>(
        ".voice-speaker-name",
      );
      if (nameEl && nameEl.textContent !== entries[i].label) {
        nameEl.textContent = entries[i].label;
      }
    }
    return;
  }

  while (speakerOverlay.firstChild) {
    speakerOverlay.removeChild(speakerOverlay.firstChild);
  }
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const row = document.createElement("div");
    row.className = "voice-speaker-entry";
    if (entry.isSelf) row.classList.add("voice-speaker-self");
    row.dataset.key = desiredKeys[i];

    const icon = document.createElement("span");
    icon.className = "voice-speaker-icon";
    icon.setAttribute("aria-hidden", "true");

    const name = document.createElement("span");
    name.className = "voice-speaker-name";
    name.textContent = entry.label;

    row.appendChild(icon);
    row.appendChild(name);
    speakerOverlay.appendChild(row);
  }
}

function updatePlayerListSpeaking() {
  const speakingUids = new Set(getSpeakingUids());
  const localUID = getLocalPlayerID();
  const localTalking = isLocalSpeaking();

  // Update all visible player rows
  const rows = document.querySelectorAll<HTMLTableRowElement>(
    "#client_playerlist tbody tr",
  );
  rows.forEach((row) => {
    const match = row.id.match(/client_playerlist_entry(\d+)/);
    if (!match) return;
    const uid = parseInt(match[1], 10);
    const isSpeaking =
      (uid === localUID && localTalking) || speakingUids.has(uid);
    const imgCell = row.cells[0];
    if (imgCell) {
      if (isSpeaking) {
        imgCell.classList.add("voice-speaking-cell");
      } else {
        imgCell.classList.remove("voice-speaking-cell");
      }
    }
  });
}

async function populateDeviceList(): Promise<void> {
  if (!deviceSelect) return;
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.enumerateDevices !== "function"
  ) {
    return;
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const previousValue = deviceSelect.value;
    while (deviceSelect.options.length > 0) {
      deviceSelect.remove(0);
    }
    deviceSelect.add(new Option("Default", ""));
    let idx = 1;
    for (const device of devices) {
      if (device.kind !== "audioinput") continue;
      const label = device.label || `Microphone ${idx}`;
      deviceSelect.add(new Option(label, device.deviceId));
      idx++;
    }
    const saved = localStorage.getItem("voiceInputDevice");
    const target = previousValue || saved || getInputDeviceId() || "";
    if (target) {
      const found = Array.from(deviceSelect.options).some(
        (opt) => opt.value === target,
      );
      deviceSelect.value = found ? target : "";
    }
    deviceListPopulated = true;
  } catch (e) {
    console.warn("Failed to enumerate audio devices", e);
  }
}

function onTapButtonClick() {
  if (!isInVoice()) return;
  tapActive = !tapActive;
  setPTT(tapActive);
  render();
}

export async function toggleVoice(): Promise<void> {
  if (!isVoiceAvailable() || toggleInFlight) return;
  toggleInFlight = true;
  try {
    if (isInVoice() && !isListenOnly()) {
      // Mic is on — disconnect mic, go back to listen-only
      if (tapActive) {
        tapActive = false;
        setPTT(false);
      }
      leaveVoice();
      await joinVoiceListenOnly();
    } else if (isListenOnly()) {
      // Currently listen-only — upgrade to full voice (enable mic)
      await joinVoice();
      await populateDeviceList();
    } else {
      // Not connected at all — join listen-only
      await joinVoiceListenOnly();
    }
  } catch (e) {
    console.error("Voice toggle failed", e);
    if (settingsStatusLine) {
      settingsStatusLine.textContent = "Microphone unavailable";
    }
  } finally {
    toggleInFlight = false;
    render();
  }
}

function onVCMuteClick() {
  const muted = !isVCMuted();
  setVCMuted(muted);
  localStorage.setItem("vcMuted", muted ? "1" : "0");
  render();
}

let pttKeyEngaged = false;

function releasePttFromKey() {
  if (!pttKeyEngaged) return;
  pttKeyEngaged = false;
  setPTT(false);
  render();
}

function onKeyDown(e: KeyboardEvent) {
  if (!isVoiceAvailable() || !isInVoice() || !isPTTOnly()) return;
  if (e.key !== "v" && e.key !== "V") return;
  if (isTypingTarget(e.target)) return;
  if (e.repeat) return;
  pttKeyEngaged = true;
  setPTT(true);
  render();
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key !== "v" && e.key !== "V") return;
  // Always release if keydown engaged PTT, regardless of where focus is now —
  // otherwise refocusing into a text input mid-press leaves the mic stuck on.
  releasePttFromKey();
}

function onWindowBlur() {
  // Window losing focus suppresses keyup, so force-release here.
  releasePttFromKey();
}

async function onDeviceChange() {
  if (!deviceSelect) return;
  const id = deviceSelect.value;
  localStorage.setItem("voiceInputDevice", id);
  try {
    await setInputDevice(id);
  } catch (e) {
    if (settingsStatusLine) {
      settingsStatusLine.textContent = "Could not switch microphone";
    }
  }
  render();
}

function onOutputVolumeChange() {
  if (!outputVolumeSlider) return;
  const v = Number(outputVolumeSlider.value);
  setOutputVolume(v);
  localStorage.setItem("voiceOutputVolume", String(v));
}

export function installVoiceUI(): void {
  if (installed) return;
  if (typeof document === "undefined" || !document.body) {
    document.addEventListener("DOMContentLoaded", installVoiceUI, { once: true });
    return;
  }
  installed = true;

  menuButton = document.getElementById("menu_voice");
  menuIcon = document.getElementById("menu_voice_icon");
  menuText = document.getElementById("menu_voice_text");

  settingsFieldset = document.getElementById(
    "voice_settings",
  ) as HTMLFieldSetElement | null;
  settingsToggleButton = document.getElementById(
    "voice_toggle_button",
  ) as HTMLButtonElement | null;
  settingsStatusLine = document.getElementById("voice_status_line");
  settingsSpeakingList = document.getElementById("voice_speaking_list");
  pttControls = document.getElementById("voice_ptt_controls");
  tapButton = document.getElementById(
    "voice_tap_button",
  ) as HTMLButtonElement | null;
  openMicRow = document.getElementById("menu_voice_openmic_row");
  openMicCheck = document.getElementById(
    "voice_openmic_check",
  ) as HTMLInputElement | null;
  deviceSelect = document.getElementById(
    "voice_input_device",
  ) as HTMLSelectElement | null;
  outputVolumeSlider = document.getElementById(
    "voice_output_volume",
  ) as HTMLInputElement | null;
  vcMuteButton = document.getElementById(
    "voice_mute_button",
  ) as HTMLButtonElement | null;
  speakerOverlay = document.getElementById("voice_speaker_overlay");

  if (vcMuteButton) {
    const savedMuted = localStorage.getItem("vcMuted") === "1";
    if (savedMuted) {
      setVCMuted(true);
    }
    vcMuteButton.addEventListener("click", onVCMuteClick);
  }

  if (settingsToggleButton) {
    settingsToggleButton.addEventListener("click", () => {
      void toggleVoice();
    });
  }
  if (tapButton) {
    tapButton.addEventListener("click", onTapButtonClick);
  }
  if (openMicCheck) {
    const savedOpenMic = localStorage.getItem("voiceOpenMic") === "1";
    if (savedOpenMic) {
      setLocalOpenMic(true);
    }
    openMicCheck.addEventListener("change", () => {
      const enabled = openMicCheck!.checked;
      setLocalOpenMic(enabled);
      localStorage.setItem("voiceOpenMic", enabled ? "1" : "0");
      render();
    });
  }
  if (deviceSelect) {
    deviceSelect.addEventListener("change", () => {
      void onDeviceChange();
    });
  }
  if (outputVolumeSlider) {
    const stored = localStorage.getItem("voiceOutputVolume");
    if (stored) {
      outputVolumeSlider.value = stored;
      setOutputVolume(Number(stored));
    } else {
      outputVolumeSlider.value = String(getOutputVolume());
    }
    outputVolumeSlider.addEventListener("input", onOutputVolumeChange);
    outputVolumeSlider.addEventListener("change", onOutputVolumeChange);
  }

  // Pre-populate device list with whatever labels are available pre-permission.
  void populateDeviceList();
  if (
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.addEventListener === "function"
  ) {
    navigator.mediaDevices.addEventListener("devicechange", () => {
      void populateDeviceList();
    });
  }

  function onCapsUpdated() {
    if (isVoiceAvailable() && !isInVoice()) {
      void joinVoiceListenOnly();
    }
    render();
  }

  onCapsChange(onCapsUpdated);
  window.addEventListener("voice-caps-updated", onCapsUpdated);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onWindowBlur);
  onSpeakingChange(render);

  render();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installVoiceUI, { once: true });
  } else {
    installVoiceUI();
  }
}

// Suppress unused warning when populateDeviceList is unused otherwise.
void deviceListPopulated;
