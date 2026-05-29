import { AO_HOST } from "../../client/aoHost";

export function createTestimonyAudio() {
  const testimonyAudio = document.getElementById(
    "client_testimonyaudio",
  ) as HTMLAudioElement;
  testimonyAudio.src = `${AO_HOST}sounds/general/sfx-guilty.opus`;
  return testimonyAudio;
}
