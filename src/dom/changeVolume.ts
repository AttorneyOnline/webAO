/** Triggered by the sound effect volume slider. */
export function changeSFXVolume(): void {
  const sfxAudioElement = document.getElementById("client_sfxaudio") as HTMLAudioElement;
  if (sfxAudioElement) {
    localStorage.setItem("sfxVolume", sfxAudioElement.volume.toString());
  }
}

/** Triggered by the testimony volume slider. */
export function changeTestimonyVolume(): void {
  const testimonyAudioElement = document.getElementById("client_testimonyaudio") as HTMLAudioElement;
  if (testimonyAudioElement) {
    localStorage.setItem(
      "testimonyVolume",
      testimonyAudioElement.volume.toString(),
    );
  }
}

/** Triggered by the shout volume slider. */
export function changeShoutVolume(): void {
  const shoutAudioElement = document.getElementById("client_shoutaudio") as HTMLAudioElement;
  if (shoutAudioElement) {
    localStorage.setItem("shoutVolume", shoutAudioElement.volume.toString());
  }
}
