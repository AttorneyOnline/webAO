import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  mock,
} from "bun:test";

const setOldLoadingMock = mock(() => {});

// Mock the full named surface of `../client`, not just `setOldLoading`.
// The mocked module replaces the real one for the entire `bun test` run
// (mock.restore() doesn't invalidate already-cached importers), so any
// downstream test file that statically imports anything from `../client`
// will fail at module-load time if that name isn't in this object.
mock.module("../client", () => ({
  client: {},
  clientState: { NotConnected: 0, Connected: 1, Joined: 2, Reconnecting: 3 },
  autoChar: undefined,
  autoArea: undefined,
  oldLoading: false,
  setOldLoading: setOldLoadingMock,
  setExtraFeatures: () => {},
  UPDATE_INTERVAL: 60,
  extrafeatures: [],
  CHATBOX: "",
  setCHATBOX: () => {},
  setClient: () => {},
  setLastICMessageTime: () => {},
  lastICMessageTime: new Date(0),
  setSelectedMenu: () => {},
  setSelectedShout: () => {},
  selectedMenu: 1,
  selectedShout: 0,
  setOldLoading2: () => {},
  delay: () => Promise.resolve(),
}));

mock.module("../services/request", () => ({
  __esModule: true,
  default: mock(() => Promise.resolve("")),
  request: mock(() => Promise.resolve("")),
  requestBuffer: mock(() => Promise.resolve(new ArrayBuffer(0))),
}));

mock.module("../utils/fileExists", () => ({
  __esModule: true,
  default: mock(() => Promise.resolve(false)),
}));

const { isLowMemory } = await import("../client/isLowMemory");
const { setAOhost } = await import("../client/aoHost");

beforeAll(() => {
  setAOhost("https://example.com/");
});

describe("isLowMemory", () => {
  beforeEach(() => {
    setOldLoadingMock.mockReset();
  });

  it("should call setOldLoading with true when user agent is low memory device", () => {
    Object.defineProperty(window, "navigator", {
      value: {
        userAgent:
          "Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.270 Safari/537.36 WebAppManager",
      },
      writable: true,
      configurable: true,
    });
    isLowMemory();

    expect(setOldLoadingMock).toHaveBeenCalled();
  });

  it("should not call setOldLoading when user agent is not a low memory device", () => {
    Object.defineProperty(window, "navigator", {
      value: {
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
      },
      writable: true,
      configurable: true,
    });
    isLowMemory();

    expect(setOldLoadingMock).not.toHaveBeenCalled();
  });

  it("should call setOldLoading with true for different low memory devices", () => {
    const testCases = [
      "Mozilla/5.0 (iPod touch; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.0 Mobile/14F89 Safari/602.1",
      "Mozilla/5.0 (Linux U; en-US) AppleWebKit/528.5 (KHTML, like Gecko, Safari/528.5 ) Version/4.0 Kindle/3.0 (screen 600x800; rotate) [ip:134.209.137.157]",
      "Mozilla/5.0 (New Nintendo 3DS like iPhone) AppleWebKit/536.30 (KHTML, like Gecko) NX/3.0.0.5.24 Mobile NintendoBrowser/1.12.10178.EU",
    ];

    for (const device of testCases) {
      Object.defineProperty(window, "navigator", {
        value: { userAgent: device },
        writable: true,
        configurable: true,
      });
      isLowMemory();

      expect(setOldLoadingMock).toHaveBeenCalledWith(true);
    }
  });
});
