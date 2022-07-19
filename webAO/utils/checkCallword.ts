import { AO_HOST } from "../client";
import { callwords } from "../client";
/**
 * check if the message contains an entry on our callword list
 * @param {string} message
 */
export function checkCallword(message: string, sfxAudio: HTMLAudioElement) {
  callwords.forEach(testCallword);
  function testCallword(item: string) {
    if (item !== "" && message.toLowerCase().includes(item.toLowerCase())) {
      sfxAudio.pause();
      sfxAudio.src = `${AO_HOST}sounds/general/sfx-gallery.opus`;
      sfxAudio.play();
    }
  }
}
