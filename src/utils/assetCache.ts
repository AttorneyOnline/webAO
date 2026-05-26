/**
 * Unified asset resolution and preloading cache.
 *
 * Every resolve/preload function caches its promise by URL, so:
 * - Concurrent calls for the same URL share one in-flight request
 * - Subsequent calls return instantly from cache
 * - Results are cached for the entire session (CDN assets don't change mid-session)
 *
 * fileExists.ts handles HEAD-request caching independently (same pattern).
 * This module handles everything above that: URL resolution, image/audio
 * preloading, and animation duration calculation.
 */

import findImgSrc from "./findImgSrc";
import fileExists from "./fileExists";
import getAnimLength from "./getAnimLength";
import transparentPng from "../constants/transparentPng";

const PRELOAD_TIMEOUT_MS = 5000;
const AUDIO_PRELOAD_TIMEOUT_MS = 3000;

/** All cached promises, keyed by a type-prefixed key */
const cache = new Map<string, Promise<any>>();

// ── Core cache helper ───────────────────────────────────────────────

function cached<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = cache.get(key);
  if (existing !== undefined) return existing;
  const promise = factory();
  cache.set(key, promise);
  return promise;
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Resolves which URL from a candidate list exists, then preloads the
 * image into the browser cache. Returns the resolved URL or transparentPng.
 *
 * Cached by the candidate list (stringified), so the same set of
 * candidates always returns the same resolved+preloaded URL.
 */
export function resolveAndPreloadImage(urls: string[]): Promise<string> {
  const key = `img:${urls.join("|")}`;
  return cached(key, async () => {
    const url = await findImgSrc(urls);
    if (url && url !== transparentPng) {
      await doPreloadImage(url);
    }
    return url;
  });
}

/**
 * Checks if an audio URL exists, then preloads it into the browser cache.
 * Returns the URL if it exists, or null.
 */
export function resolveAndPreloadAudio(url: string): Promise<string | null> {
  const key = `audio:${url}`;
  return cached(key, async () => {
    const exists = await fileExists(url);
    if (!exists) return null;
    await doPreloadAudio(url);
    return url;
  });
}

/**
 * Preloads an audio URL that is already known to exist (no HEAD check).
 * Useful when the URL comes from a trusted source like client.resources.
 */
export function preloadKnownAudio(url: string): Promise<string> {
  const key = `audio:${url}`;
  return cached(key, async () => {
    await doPreloadAudio(url);
    return url;
  });
}

/**
 * Gets the animation duration for a base URL (tries .gif, .webp, .apng).
 * Downloads the file to count frames, which also primes the browser cache.
 */
export function getAnimDuration(baseUrl: string): Promise<number> {
  const key = `animdur:${baseUrl}`;
  return cached(key, () => getAnimLength(baseUrl));
}

// ── Internal preloaders ─────────────────────────────────────────────

function doPreloadImage(url: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const img = new Image();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) { settled = true; resolve(); }
    }, PRELOAD_TIMEOUT_MS);

    img.onload = () => {
      if (!settled) { settled = true; clearTimeout(timer); resolve(); }
    };
    img.onerror = () => {
      if (!settled) { settled = true; clearTimeout(timer); resolve(); }
    };
    img.src = url;
  });
}

function doPreloadAudio(url: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const audio = new Audio();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) { settled = true; resolve(); }
    }, AUDIO_PRELOAD_TIMEOUT_MS);

    audio.oncanplaythrough = () => {
      if (!settled) { settled = true; clearTimeout(timer); resolve(); }
    };
    audio.onerror = () => {
      if (!settled) { settled = true; clearTimeout(timer); resolve(); }
    };
    audio.preload = "auto";
    audio.src = url;
  });
}
