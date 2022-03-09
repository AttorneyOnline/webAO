/**
 * Escapes a string to AO1 escape codes.
 * @param {string} estring the string to be escaped
 */
export function escapeChat(estring) {
  return estring
    .replace(/#/g, '<num>')
    .replace(/&/g, '<and>')
    .replace(/%/g, '<percent>')
    .replace(/\$/g, '<dollar>');
}

/**
 * Unescapes a string to AO1 escape codes.
 * @param {string} estring the string to be unescaped
 */
export function unescapeChat(estring) {
  return estring
    .replace(/<num>/g, '#')
    .replace(/<and>/g, '&')
    .replace(/<percent>/g, '%')
    .replace(/<dollar>/g, '$');
}

/**
 * Escapes a string to be HTML-safe.
 *
 * XXX: This is unnecessary if we use `createTextNode` instead!
 * @param {string} unsafe an unsanitized string
 */
export function safeTags(unsafe) {
  if (unsafe) {
    return unsafe
      .replace(/>/g, '&gt;')
      .replace(/</g, '&lt;');
  }
  return '';
}

/**
 * Encode text on client side.
 * @param {string} estring the string to be encoded
 */
export function encodeChat(estring) {
  const selectedEncoding = document.getElementById('client_encoding').value;
  if (selectedEncoding === 'unicode') {
    // This approach works by escaping all special characters to Unicode escape sequences.
    // Source: https://gist.github.com/mathiasbynens/1243213
    return estring.replace(/[^\0-~]/g, (ch) => `\\u${(`000${ch.charCodeAt().toString(16)}`).slice(-4)}`);
  } if (selectedEncoding === 'utf16') {
    // Source: https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    const buffer = new ArrayBuffer(estring.length * 2);
    const result = new Uint16Array(buffer);
    for (let i = 0, strLen = estring.length; i < strLen; i++) {
      result[i] = estring.charCodeAt(i);
    }
    return String(result);
  }
  return estring;
}

/**
 * Decodes text on client side.
 * @param {string} estring the string to be decoded
 */
export function decodeChat(estring) {
  const selectedDecoding = document.getElementById('client_decoding').value;
  if (selectedDecoding === 'unicode') {
    // Source: https://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
    return estring.replace(/\\u([\d\w]{1,})/gi, (match, group) => String.fromCharCode(parseInt(group, 16)));
  } if (selectedDecoding === 'utf16') {
    // Source: https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    return String.fromCharCode.apply(null, new Uint16Array(estring.split(',')));
  }
  return estring;
}

/**
 * XXX: a nasty hack made by gameboyprinter.
 * @param {string} msg chat message to prepare for display
 */
export function prepChat(msg) {
  // TODO: make this less awful
  return unescapeChat(decodeChat(msg));
}
