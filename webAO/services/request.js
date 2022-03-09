/**
 * Make a GET request for a specific URI.
 * @param {string} url the URI to be requested
 * @returns response data
 * @throws {Error} if status code is not 2xx, or a network error occurs
 */
const request = async (url) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'text';
  xhr.addEventListener('error', () => {
    const err = new Error(`Request for ${url} failed: ${xhr.statusText}`);
    err.code = xhr.status;
    reject(err);
  });
  xhr.addEventListener('abort', () => {
    const err = new Error(`Request for ${url} was aborted!`);
    err.code = xhr.status;
    reject(err);
  });
  xhr.addEventListener('load', () => {
    if (xhr.status < 200 || xhr.status >= 300) {
      const err = new Error(`Request for ${url} failed with status code ${xhr.status}`);
      err.code = xhr.status;
      reject(err);
    } else {
      resolve(xhr.response);
    }
  });
  xhr.open('GET', url, true);
  xhr.send();
});
export default request;
