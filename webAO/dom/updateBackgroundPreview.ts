import { AO_HOST } from "../client";
/**
 * Update background preview.
 */
export function updateBackgroundPreview() {
  const background_select = <HTMLSelectElement>(
    document.getElementById("bg_select")
  );
  const background_filename = <HTMLInputElement>(
    document.getElementById("bg_filename")
  );
  const background_preview = <HTMLImageElement>(
    document.getElementById("bg_preview")
  );

  if (background_select.selectedIndex === 0) {
    background_filename.style.display = "initial";
    background_preview.src = `${AO_HOST}background/${encodeURI(
      background_filename.value.toLowerCase()
    )}/defenseempty.png`;
  } else {
    background_filename.style.display = "none";
    background_preview.src = `${AO_HOST}background/${encodeURI(
      background_select.value.toLowerCase()
    )}/defenseempty.png`;
  }
}
window.updateBackgroundPreview = updateBackgroundPreview;
