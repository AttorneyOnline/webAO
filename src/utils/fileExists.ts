const cache = new Map<string, Promise<boolean>>();

export default function fileExists(url: string): Promise<boolean> {
  const cached = cache.get(url);
  if (cached !== undefined) return cached;

  const promise = new Promise<boolean>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url);
    xhr.onload = function checkLoad() {
      if (xhr.readyState === 4) {
        resolve(xhr.status === 200);
      }
    };
    xhr.onerror = function checkError() {
      resolve(false);
    };
    xhr.send(null);
  });

  cache.set(url, promise);
  return promise;
}
