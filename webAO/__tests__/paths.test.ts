import { getFilenameFromPath } from '../utils/paths';

// Test Case 1: Valid Path with Filename
test('should return the filename for a valid path', () => {
  const result = getFilenameFromPath('/path/to/file.txt');
  expect(result).toBe('file.txt');
});

// Test Case 2: Path without File Extension
test('should handle paths without file extension', () => {
  const result = getFilenameFromPath('/path/to/file');
  expect(result).toBe('file');
});

// Test Case 3: Empty String
test('should return an empty string if input is empty', () => {
  const result = getFilenameFromPath('');
  expect(result).toBe('');
});

// Test Case 4: Path with Multiple Slashes
test('should handle paths with multiple consecutive slashes', () => {
  const result = getFilenameFromPath('//path//to///file.txt');
  expect(result).toBe('file.txt');
});

// Test Case 5: No Filename in Path
test('should return an empty string if there is no filename in the path', () => {
  const result = getFilenameFromPath('/path/to/');
  expect(result).toBe('');
});
