import {canonicalizePath} from "./paths"
import {binarySearch} from "./binarySearch"

const fileExists = async (url) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open('HEAD', url);
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    }
  };
  xhr.onerror = function (e) {
    resolve(false);
  };
  xhr.send(null);
});
export default fileExists;

/* Returns whether file exists.
 * `manifest' is a sorted array of strings.
 * `ao_head' is the base URL.
 * `url' is a URL-encoded path.
 * If manifest is empty, check the old way.
 * Otherwise, look it up in the manifest */
const fileExistsManifest = async (manifest, ao_host, url) =>
      new Promise((resolve, reject) => {

          if(manifest == undefined ||
             manifest == null ||
             manifest.length == 0)
              resolve(fileExists(ao_host + url));

          const c_url = encodeURI(canonicalizePath(decodeURI(url)));

          if(binarySearch(manifest, c_url) != null)
              resolve(true);

          resolve(false);
      });
export {fileExistsManifest};
