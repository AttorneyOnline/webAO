/**
 * Triggered when there was an error loading a generic sprite. We
 * remove the src attribute entirely (rather than setting src="",
 * which would re-fire the error event and cause an infinite loop
 * under the document-level delegated listener in dom/dispatch.ts).
 */
export function imgError(image: HTMLImageElement) {
  if (!image.hasAttribute("src")) return;
  image.removeAttribute("src");
}
