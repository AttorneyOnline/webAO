const missingUrls = new Set<string>();

export default async function fileExists(url: string): Promise<boolean> {
  if (missingUrls.has(url)) return false;

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url);
    xhr.onload = function checkLoad() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(true);
        } else {
          missingUrls.add(url);
          resolve(false);
        }
      }
    };
    xhr.onerror = function checkError() {
      missingUrls.add(url);
      resolve(false);
    };
    xhr.send(null);
  });
}

export function clearMissingCache(): void {
  missingUrls.clear();
}
