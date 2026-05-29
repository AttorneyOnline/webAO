export function isCategory(trackname: string) {
  const audioEndings = ["==", "--"];
  return (
    audioEndings.filter((ending) => trackname.startsWith(ending)).length === 1
  );
}
