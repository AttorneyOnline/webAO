export function getFilenameFromPath(path: string) {
  return path.substring(path.lastIndexOf("/") + 1);
}
