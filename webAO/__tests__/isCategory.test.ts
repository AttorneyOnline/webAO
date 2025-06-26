import { isCategory } from '../client/isCategory';

describe('isCategory function', () => {
  test('returns true if trackname starts with "=="', () => {
    expect(isCategory('== Ace Attorney ==')).toBe(true);
  });

  test('returns true if trackname starts with "--"', () => {
    expect(isCategory('-- Danganronpa --')).toBe(true);
  });

  test('returns true if trackname contains weird characters', () => {
    expect(isCategory('--== JSR 📻  ==--')).toBe(true);
  });

  test('returns false if trackname does not start with a valid category indicator', () => {
    expect(isCategory('sin.mp3')).toBe(false);
    expect(isCategory('bogus.ogg')).toBe(false); // This has both indicators but in wrong format
  });

  test('returns false for an empty track name', () => {
    expect(isCategory('')).toBe(false);
  });
});