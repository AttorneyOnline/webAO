interface RequestError extends Error {
  code?: number;
}

/**
 * Make a GET request for a specific URI.
 * @throws {Error} if status code is not 2xx, or a network error occurs
 */
export async function requestBuffer(url: string): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "arraybuffer";
    xhr.addEventListener("error", () => {
      const err: RequestError = new Error(`Request for ${url} failed: ${xhr.statusText}`);
      err.code = xhr.status;
      reject(err);
    });
    xhr.addEventListener("abort", () => {
      const err: RequestError = new Error(`Request for ${url} was aborted!`);
      err.code = xhr.status;
      reject(err);
    });
    xhr.addEventListener("load", () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        const err: RequestError = new Error(
          `Request for ${url} failed with status code ${xhr.status}`,
        );
        err.code = xhr.status;
        reject(err);
      } else {
        resolve(xhr.response);
      }
    });
    xhr.open("GET", url, true);
    xhr.send();
  });
}

/**
 * Make a GET request for a specific URI.
 * @throws {Error} if status code is not 2xx, or a network error occurs
 */
export const request = async (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = "text";
    xhr.addEventListener("error", () => {
      const err: RequestError = new Error(`Request for ${url} failed: ${xhr.statusText}`);
      err.code = xhr.status;
      reject(err);
    });
    xhr.addEventListener("abort", () => {
      const err: RequestError = new Error(`Request for ${url} was aborted!`);
      err.code = xhr.status;
      reject(err);
    });
    xhr.addEventListener("load", () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        const err: RequestError = new Error(
          `Request for ${url} failed with status code ${xhr.status}`,
        );
        err.code = xhr.status;
        reject(err);
      } else {
        resolve(xhr.response);
      }
    });
    xhr.open("GET", url, true);
    xhr.send();
  });
export default request;
