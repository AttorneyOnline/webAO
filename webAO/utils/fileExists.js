import {AO_HOST} from "../client/aoHost"
import {client} from "../client"
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
 * `url' is a URL, including the base URL for bw compat.
 * If manifest is empty, check the old way.
 * Otherwise, look it up in the manifest */
const fileExistsManifest = async (url) =>
      new Promise((resolve, reject) => {
          if(client.manifest.length == 0) {
              resolve(fileExists(url));
              return;
          }
          const c_url = encodeURI(canonicalizePath(decodeURI(url.slice(AO_HOST.length))));

          if(binarySearch(client.manifest, c_url) != null)
              resolve(true);

          resolve(false);
      });
export {fileExistsManifest};
