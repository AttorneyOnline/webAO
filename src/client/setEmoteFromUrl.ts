import { Side } from "../packets/MS";
import transparentPng from "../constants/transparentPng";

// Function rather than module-level array: enum members are accessed only
// at call time, avoiding "Side is undefined" during circular-import init.
const isFullView = (s: Side): boolean =>
  s === Side.DEFENSE || s === Side.PROSECUTION || s === Side.WITNESS;

/**
 * Sets a pre-resolved emote URL on the correct DOM <img> element.
 * This is synchronous because the image should already be in the browser cache
 * from preloading.
 */
const setEmoteFromUrl = (url: string, pair: boolean, side: Side): void => {
  const pairID = pair ? "pair" : "char";
  const position = isFullView(side) ? `${side}_` : "";
  const emoteSelector = document.getElementById(
    `client_${position}${pairID}_img`,
  ) as HTMLImageElement;

  if (emoteSelector) {
    emoteSelector.src = url || transparentPng;
  }
};

export default setEmoteFromUrl;
