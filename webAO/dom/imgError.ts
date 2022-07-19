/**
 * Triggered when there was an error loading a generic sprite.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function imgError(image: HTMLImageElement) {
  image.onerror = null;
  image.src = ""; // unload so the old sprite doesn't persist
  return true;
}
window.imgError = imgError;
