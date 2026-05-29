import { describe, it, expect } from "bun:test";
import { escapeFanta, unescapeFanta, safeHtmlTags, unescapeUnicode } from "../escaping";

describe('encode/decode', () => {
  it('should escape special characters correctly', () => {
    const input = '#&$%';
    const expectedOutput = '<num><and><dollar><percent>';
    expect(escapeFanta(input)).toBe(expectedOutput);
  });

  it('should unescape special characters correctly', () => {
    const input = '<num><and><dollar><percent>';
    const expectedOutput = '#&$%';
    expect(unescapeFanta(input)).toBe(expectedOutput);
  });
});

describe('safeHtmlTags', () => {
  it('should replace < with ＜ and > with ＞', () => {
    const input = '<div>Hello</div>';
    const expectedOutput = '＜div＞Hello＜/div＞';
    expect(safeHtmlTags(input)).toBe(expectedOutput);
  });

  it('should handle empty strings correctly', () => {
    expect(safeHtmlTags('')).toBe('');
  });
});

describe('unescapeUnicode', () => {
  it('should decode escaped unicode characters', () => {
    const input = '\\u0041\\u0026\\u003F';
    const expectedOutput = 'A&?';
    expect(unescapeUnicode(input)).toBe(expectedOutput);
  });

  it('should handle no unicode to decode', () => {
    const input = 'Hello World!';
    expect(unescapeUnicode(input)).toBe(input);
  });
});
