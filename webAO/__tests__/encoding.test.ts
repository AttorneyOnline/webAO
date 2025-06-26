import { escapeChat, unescapeChat, safeTags, decodeChat, prepChat } from '../encoding';

describe('encode/decode', () => {
  it('should escape special characters correctly', () => {
    const input = '#&$%';
    const expectedOutput = '<num><and><dollar><percent>';
    expect(escapeChat(input)).toBe(expectedOutput);
  });

  it('should unescape special characters correctly', () => {
    const input = '<num><and><dollar><percent>';
    const expectedOutput = '#&$%';
    expect(unescapeChat(input)).toBe(expectedOutput);
  });
});

describe('safeTags', () => {
  it('should replace < with ＜ and > with ＞', () => {
    const input = '<div>Hello</div>';
    const expectedOutput = '＜div＞Hello＜/div＞';
    expect(safeTags(input)).toBe(expectedOutput);
  });

  it('should handle empty strings correctly', () => {
    expect(safeTags('')).toBe('');
  });
});

describe('decodeChat', () => {
  it('should decode escaped unicode characters', () => {
    const input = '\\u0041\\u0026\\u003F';
    const expectedOutput = 'A&?';
    expect(decodeChat(input)).toBe(expectedOutput);
  });

  it('should handle no unicode to decode', () => {
    const input = 'Hello World!';
    expect(decodeChat(input)).toBe(input);
  });
});

describe('prepChat', () => {
  it('should apply safeTags, unescapeChat and decodeChat correctly', () => {
    const input = '<num><and>A<percent>';
    const expectedOutput = '#&A%'; // Output after applying all functions in order
    expect(prepChat(input)).toBe(expectedOutput);
  });

  it('should handle empty strings correctly', () => {
    expect(prepChat('')).toBe('');
  });
});