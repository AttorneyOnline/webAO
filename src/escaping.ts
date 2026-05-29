/**
 * Escape a string for inclusion in a fantacode wire field. AO1 uses
 * `#`, `&`, `%`, `$` as wire meta-characters; this replaces them with
 * the `<num>` / `<and>` / `<percent>` / `<dollar>` tokens so payloads
 * containing those characters survive transit.
 */
export function escapeFanta(estring: string): string {
  return estring
    .replaceAll("#", "<num>")
    .replaceAll("&", "<and>")
    .replaceAll("%", "<percent>")
    .replaceAll("$", "<dollar>");
}

/**
 * Inverse of `escapeFanta`: convert the AO1 escape tokens back into
 * their meta-character form.
 */
export function unescapeFanta(estring: string): string {
  return estring
    .replaceAll("<num>", "#")
    .replaceAll("<and>", "&")
    .replaceAll("<percent>", "%")
    .replaceAll("<dollar>", "$");
}

/**
 * Replace HTML angle brackets with full-width substitutes so a string
 * can be inserted into `innerHTML` without parsing as tags.
 *
 * XXX: unnecessary if callers used `createTextNode` instead.
 */
export function safeHtmlTags(unsafe: string): string {
  if (unsafe) {
    return unsafe.replaceAll(">", "＞").replaceAll("<", "＜");
  }
  return "";
}

/**
 * Decode `\uXXXX` Unicode escape sequences embedded in a string back
 * into their literal characters.
 */
export function unescapeUnicode(estring: string): string {
  // Source: https://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
  return estring.replace(/\\u([\d\w]{1,})/gi, (match, group) =>
    String.fromCharCode(parseInt(group, 16)),
  );
}
