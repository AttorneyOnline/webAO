import { AO_HOST } from "../client/aoHost";
import tryUrls from "../utils/tryUrls";

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
  } else {
    background_filename.style.display = "none";
  }
  tryUrls(
    `${AO_HOST}background/${encodeURI(
      background_select.value.toLowerCase(),
    )}/defenseempty`,
  ).then((resp) => {
    background_preview.src = resp;
  });
}
window.updateBackgroundPreview = updateBackgroundPreview;
