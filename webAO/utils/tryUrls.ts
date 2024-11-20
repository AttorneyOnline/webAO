import fileExists from "./fileExists";
import transparentPng from "../constants/transparentPng";
const urlExtensionsToTry = [".png", ".gif", ".webp", ".apng"];
const tryUrls = async (url: string) => {
  for (let i = 0; i < urlExtensionsToTry.length; i++) {
    const extension = urlExtensionsToTry[i];
    const fullFileUrl = url + extension;
    const exists = await fileExists(fullFileUrl);
    if (exists) {
      return fullFileUrl;
    }
  }
  return transparentPng;
};
export default tryUrls;
