import filesExist from "./filesExist";
import transparentPng from "../constants/transparentPng";

/**
 * This function takes a list of urls and returns the first one that exists.
 * If none is found, return a transparent png.
 * The function will always return a value that is appriopriate for an img src.
 * @param urls The list of urls to try
 * @returns The image source of the first url that exists, or a transparent png if none exist
 */
export default async function findImgSrc(urls: string[]): Promise<string> {
  return filesExist(urls).then((url) => {
    if (url !== null) {
      return url;
    }
    // If none of the images exist, return a transparent png
    return transparentPng;
  });
}
