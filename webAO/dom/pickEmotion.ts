import { client } from "../client";
/**
 * Highlights and selects an emotion for in-character chat.
 * @param {string} emo the new emotion to be selected
 */
export function pickEmotion(emo: number) {
  try {
    if (client.selectedEmote !== -1) {
      document.getElementById(`emo_${client.selectedEmote}`)!.className =
        "emote_button";
    }
  } catch (err) {
    // do nothing
  }
  client.selectedEmote = emo;
  document.getElementById(`emo_${emo}`)!.className = "emote_button dark";

  const emote = client.emote;
  if (emote) {
    (<HTMLInputElement>document.getElementById("sendsfx")).checked =
      emote.sfx.length > 1;

    (<HTMLInputElement>document.getElementById("sendpreanim")).checked =
      emote.zoom == 1;
  }

  (<HTMLInputElement>document.getElementById("client_inputbox")).focus();
}
window.pickEmotion = pickEmotion;
