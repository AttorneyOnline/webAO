/**
 * Triggered when there was an error loading a sound
 * @param {HTMLAudioElement} image the element containing the missing sound
 */
export function opusCheck(
  channel: HTMLAudioElement
): OnErrorEventHandlerNonNull {
  const audio = channel.src;
  if (audio === "") {
    return;
  }
  console.warn(`failed to load sound ${channel.src}`);
  let oldsrc = "";
  let newsrc = "";
  oldsrc = channel.src;
  if (!oldsrc.endsWith(".opus")) {
    newsrc = oldsrc.replace(".mp3", ".opus");
    newsrc = newsrc.replace(".wav", ".opus");
    channel.src = newsrc; // unload so the old sprite doesn't persist
  }
}
window.opusCheck = opusCheck;