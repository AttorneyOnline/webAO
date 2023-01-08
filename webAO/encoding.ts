/**
 * Escapes a string to AO1 escape codes.
 * @param {string} estring the string to be escaped
 */
export function escapeChat(estring: string): string {
  return estring
    .replace('#', '<num>')
    .replace('&', '<and>')
    .replace('%', '<percent>')
    .replace('$', '<dollar>');
}

/**
 * Unescapes a string to AO1 escape codes.
 * @param {string} estring the string to be unescaped
 */
export function unescapeChat(estring: string): string {
  return estring
    .replace('<num>', '#')
    .replace('<and>', '&')
    .replace('<percent>', '%')
    .replace('<dollar>', '$');
}

/**
 * Escapes a string to be HTML-safe.
 *
 * XXX: This is unnecessary if we use `createTextNode` instead!
 * @param {string} unsafe an unsanitized string
 */
export function safeTags(unsafe: string): string {
  if (unsafe) {
    return unsafe
      .replace('>', '＞')
      .replace('<', '＜');
  }
  return '';
}

/**
 * Decodes text on client side.
 * @param {string} estring the string to be decoded
 */
export function decodeChat(estring: string): string {
    // Source: https://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
    return estring.replace(/\\u([\d\w]{1,})/gi, (match, group) => String.fromCharCode(parseInt(group, 16)));
}

/**
 * XXX: a nasty hack made by gameboyprinter.
 * @param {string} msg chat message to prepare for display
 */
export function prepChat(msg: string): string {
  // TODO: make this less awful
  return unescapeChat(decodeChat(msg));
}
