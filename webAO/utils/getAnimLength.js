/* eslint no-await-in-loop: "warn" */
/* eslint no-restricted-syntax: "off" */
/* TODO: use promises for this */

import calculatorHandler from "./calculatorHandler";
import fileExists from "./fileExists";
import { requestBuffer } from "../services/request";
/**
 * Gets animation length. If the animation cannot be found, it will
 * silently fail and return 0 instead.
 * @param {string} filename the animation file name
 */

const getAnimLength = async (url) => {
  const extensions = [".gif", ".webp", ".apng"];
  for (const extension of extensions) {
    const urlWithExtension = url + extension;
    const exists = await fileExists(urlWithExtension);
    if (exists) {
      const fileBuffer = await requestBuffer(urlWithExtension);
      const length = calculatorHandler[extension](fileBuffer);
      return length;
    }
  }
  return 0;
};
export default getAnimLength;
