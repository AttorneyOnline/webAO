import transparentPng from "../constants/transparentPng";

/**
 * Triggered when there was an error loading a character sprite.
 * @param {HTMLImageElement} image the element containing the missing image
 */
export function charError(image: HTMLImageElement) {
    console.warn(`${image.src} is missing from webAO`);
    image.src = transparentPng;
    return true;
}
window.charError = charError;