export const getFilenameFromPath = (path: string) => path.substring(path.lastIndexOf('/') + 1)

/* Removes `/./`, `/../`, and `//`.
 * Does not add a leading `/` or `./`.
 * Does not add a trailing `/`. */
export function canonicalizePath(path: string): string {
  const path_elements = path.split("/");
  var result: string[] = [];

  for (const el of path_elements) {
    if (el === "..")
      result.pop();
    else if (el === "." || el === "")
      continue;

    result.push(el);
  }

  return result.join("/");
}
