import { isLowMemory } from '../client/isLowMemory';
import { setOldLoading } from '../client';
import { AO_HOST, setAOhost } from '../client/aoHost';

// Mock the setOldLoading function and prevent any network requests
jest.mock('../client', () => ({
  setOldLoading: jest.fn(),
}));

// Mock any potential network requests
jest.mock('../services/request', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(''),
  request: jest.fn().mockResolvedValue(''),
  requestBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
}));

// Mock the fileExists function to prevent network requests
jest.mock('../utils/fileExists', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(false),
}));

// Set AO_HOST to a valid URL before tests run
beforeAll(() => {
  setAOhost('https://example.com/');
});

describe('isLowMemory', () => {
  beforeEach(() => {
    // Reset mock before each test to ensure isolation
    (setOldLoading as jest.Mock).mockReset();
  });

  it('should call setOldLoading with true when user agent is low memory device', () => {
    Object.defineProperty(window, 'navigator', { value: { userAgent: 'Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.270 Safari/537.36 WebAppManager' }, writable: true });
    isLowMemory();

    expect(setOldLoading).toHaveBeenCalled();
  });

  it('should not call setOldLoading when user agent is not a low memory device', () => {
    Object.defineProperty(window, 'navigator', { value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36' }, writable: true });
    isLowMemory();

    expect(setOldLoading).not.toHaveBeenCalled();
  });

  it('should call setOldLoading with true for different low memory devices', () => {
    const testCases = [
      'Mozilla/5.0 (iPod touch; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.0 Mobile/14F89 Safari/602.1',
      'Mozilla/5.0 (Linux U; en-US) AppleWebKit/528.5 (KHTML, like Gecko, Safari/528.5 ) Version/4.0 Kindle/3.0 (screen 600x800; rotate) [ip:134.209.137.157]',
      'Mozilla/5.0 (New Nintendo 3DS like iPhone) AppleWebKit/536.30 (KHTML, like Gecko) NX/3.0.0.5.24 Mobile NintendoBrowser/1.12.10178.EU'
    ];

    for (const device of testCases) {
      Object.defineProperty(window, 'navigator', { value: { userAgent: device }, writable: true });
      isLowMemory();

      expect(setOldLoading).toHaveBeenCalledWith(true);
    }
  });

});