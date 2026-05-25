/**
 * Audio mute state management.
 * Stores mute toggles in localStorage so they persist across sessions.
 * Uses HTMLAudioElement.muted to silence without changing volume levels.
 */

export function isMusicMuted(): boolean {
  return localStorage.getItem("musicMuted") === "1";
}

export function isSfxMuted(): boolean {
  return localStorage.getItem("sfxMuted") === "1";
}

export function isBlipMuted(): boolean {
  return localStorage.getItem("blipMuted") === "1";
}

export function applyMusicMute(muted: boolean): void {
  localStorage.setItem("musicMuted", muted ? "1" : "0");
  const channels = document.getElementsByClassName(
    "audioChannel",
  ) as HTMLCollectionOf<HTMLAudioElement>;
  for (let i = 0; i < channels.length; i++) {
    channels[i].muted = muted;
  }
}

export function applySfxMute(muted: boolean): void {
  localStorage.setItem("sfxMuted", muted ? "1" : "0");
  const ids = ["client_sfxaudio", "client_shoutaudio", "client_testimonyaudio"];
  for (const id of ids) {
    const el = document.getElementById(id) as HTMLAudioElement | null;
    if (el) el.muted = muted;
  }
}

export function applyBlipMute(muted: boolean): void {
  localStorage.setItem("blipMuted", muted ? "1" : "0");
  const channels = document.getElementsByClassName(
    "blipSound",
  ) as HTMLCollectionOf<HTMLAudioElement>;
  for (let i = 0; i < channels.length; i++) {
    channels[i].muted = muted;
  }
}

export function toggleMuteMusic(): void {
  const checkbox = document.getElementById(
    "client_mute_music",
  ) as HTMLInputElement;
  applyMusicMute(checkbox.checked);
}

export function toggleMuteSfx(): void {
  const checkbox = document.getElementById(
    "client_mute_sfx",
  ) as HTMLInputElement;
  applySfxMute(checkbox.checked);
}

export function toggleMuteBlips(): void {
  const checkbox = document.getElementById(
    "client_mute_blips",
  ) as HTMLInputElement;
  applyBlipMute(checkbox.checked);
}

window.toggleMuteMusic = toggleMuteMusic;
window.toggleMuteSfx = toggleMuteSfx;
window.toggleMuteBlips = toggleMuteBlips;
