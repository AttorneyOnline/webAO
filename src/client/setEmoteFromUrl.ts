import transparentPng from "../constants/transparentPng";

/**
 * Sets a pre-resolved emote URL on the correct DOM <img> element.
 * This is synchronous because the image should already be in the browser cache
 * from preloading.
 */
const setEmoteFromUrl = (url: string, pair: boolean, side: string): void => {
  const pairID = pair ? "pair" : "char";
  const acceptedPositions = ["def", "pro", "wit"];
  const position = acceptedPositions.includes(side) ? `${side}_` : "";
  const emoteSelector = document.getElementById(
    `client_${position}${pairID}_img`,
  ) as HTMLImageElement;

  if (emoteSelector) {
    emoteSelector.src = url || transparentPng;
  }
};

export default setEmoteFromUrl;
