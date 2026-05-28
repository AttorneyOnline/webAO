import transparentPng from "../constants/transparentPng";

/**
 * Triggered when there was an error loading a character sprite.
 * Swap in a transparent placeholder. Guarded against re-firing under
 * the document-level capture listener in dom/dispatch.ts -- setting
 * src to a data: URL fires `load`, not `error`, so no loop.
 */
export function charError(image: HTMLImageElement) {
  if (image.src === transparentPng) return;
  console.warn(`${image.src} is missing from webAO`);
  image.src = transparentPng;
}
