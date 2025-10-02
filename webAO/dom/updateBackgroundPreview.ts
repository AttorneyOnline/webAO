import { client } from "../client";
import { AO_HOST } from "../client/aoHost";
import fileExists from "../utils/fileExists";
import transparentPng from "../constants/transparentPng";

const tryBackgroundUrls = async (url: string) => {
  for (let i = 0; i < client.background_extensions.length; i++) {
    const extension = client.background_extensions[i];
    const fullFileUrl = url + extension;
    const exists = await fileExists(fullFileUrl);
    if (exists) {
      return fullFileUrl;
    }
  }
  return transparentPng;
};
export default tryBackgroundUrls;

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
  tryBackgroundUrls(
    `${AO_HOST}background/${encodeURI(
      background_select.value.toLowerCase(),
    )}/defenseempty`,
  ).then((resp) => {
    background_preview.src = resp;
  });
}
window.updateBackgroundPreview = updateBackgroundPreview;
