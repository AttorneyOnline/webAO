import { describe, test, expect } from "bun:test";
import { isAudio } from '../client/isAudio';

// Test cases
describe('isAudio', () => {
  test('should return true for valid audio file extensions', () => {
    expect(isAudio('song.wav')).toBe(true);
    expect(isAudio('music.mp3')).toBe(true);
    expect(isAudio('track.ogg')).toBe(true);
    expect(isAudio('audio.opus')).toBe(true);
  });

  test('should return false for non-audio file extensions', () => {
    expect(isAudio('image.jpg')).toBe(false);
    expect(isAudio('document.pdf')).toBe(false);
    expect(isAudio('text.txt')).toBe(false);
  });

  test('should handle edge cases', () => {
    expect(isAudio('')).toBe(false);
    expect(isAudio(undefined as any)).toBe(false);
    expect(isAudio(null as any)).toBe(false);
    expect(isAudio({} as any)).toBe(false);
  });

  test('should return true for files with multiple valid extensions', () => {
    expect(isAudio('file.wav.mp3')).toBe(true);
    expect(isAudio('track.ogg.opus')).toBe(true);
  });
});