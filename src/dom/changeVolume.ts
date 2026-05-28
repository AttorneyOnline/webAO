const SFX_AUDIO_IDS = [
  "client_sfxaudio",
  "client_shoutaudio",
  "client_testimonyaudio",
];

/** Triggered by the combined SFX/Shout/Testimony volume slider. */
export function changeSFXVolume(): void {
  const slider = document.getElementById("client_svolume") as HTMLInputElement | null;
  if (!slider) return;
  const volume = Number(slider.value);
  for (const id of SFX_AUDIO_IDS) {
    const el = document.getElementById(id) as HTMLAudioElement | null;
    if (el) el.volume = volume;
  }
  localStorage.setItem("sfxVolume", String(volume));
}
