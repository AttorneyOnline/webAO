import { CachedAssetMetadata } from "./types";

const MAX_METADATA_ENTRIES = 1000;

export interface AssetCacheConfig {
  spriteCacheName: string;
  audioCacheName: string;
  metadataCacheName: string;
}

export class AssetCache {
  private config: AssetCacheConfig;
  private metadataMap: Map<string, CachedAssetMetadata>;
  private spriteCache: Cache | null = null;
  private audioCache: Cache | null = null;

  constructor(config: Partial<AssetCacheConfig> = {}) {
    this.config = {
      spriteCacheName: config.spriteCacheName ?? "webao-sprites-v1",
      audioCacheName: config.audioCacheName ?? "webao-audio-v1",
      metadataCacheName: config.metadataCacheName ?? "webao-metadata-v1",
    };
    this.metadataMap = new Map();
  }

  private async getSpriteCache(): Promise<Cache | null> {
    if (this.spriteCache) return this.spriteCache;
    try {
      this.spriteCache = await caches.open(this.config.spriteCacheName);
      return this.spriteCache;
    } catch {
      return null;
    }
  }

  private async getAudioCache(): Promise<Cache | null> {
    if (this.audioCache) return this.audioCache;
    try {
      this.audioCache = await caches.open(this.config.audioCacheName);
      return this.audioCache;
    } catch {
      return null;
    }
  }

  private evictOldestEntries(): void {
    if (this.metadataMap.size <= MAX_METADATA_ENTRIES) return;

    const entries = Array.from(this.metadataMap.entries());
    entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);

    const toRemove = entries.slice(0, entries.length - MAX_METADATA_ENTRIES);
    for (const [key] of toRemove) {
      this.metadataMap.delete(key);
    }
  }

  async checkExists(url: string): Promise<boolean> {
    const cached = this.metadataMap.get(url);
    if (cached !== undefined) {
      return cached.exists;
    }

    try {
      const response = await fetch(url, { method: "HEAD" });
      const exists = response.ok;

      this.setMetadata(url, {
        exists,
        resolvedUrl: exists ? url : null,
        cachedAt: Date.now(),
      });

      return exists;
    } catch {
      this.setMetadata(url, {
        exists: false,
        resolvedUrl: null,
        cachedAt: Date.now(),
      });
      return false;
    }
  }

  getMetadata(url: string): CachedAssetMetadata | undefined {
    return this.metadataMap.get(url);
  }

  setMetadata(url: string, metadata: CachedAssetMetadata): void {
    this.metadataMap.set(url, metadata);
    this.evictOldestEntries();
  }

  async preloadImage(url: string): Promise<boolean> {
    const cache = await this.getSpriteCache();
    if (!cache) {
      return this.preloadImageFallback(url);
    }

    try {
      const existing = await cache.match(url);
      if (existing) return true;

      const response = await fetch(url);
      if (!response.ok) return false;

      await cache.put(url, response.clone());
      return true;
    } catch {
      return false;
    }
  }

  private preloadImageFallback(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async preloadAudio(url: string): Promise<boolean> {
    const cache = await this.getAudioCache();
    if (!cache) {
      return this.preloadAudioFallback(url);
    }

    try {
      const existing = await cache.match(url);
      if (existing) return true;

      const response = await fetch(url);
      if (!response.ok) return false;

      await cache.put(url, response.clone());
      return true;
    } catch {
      return false;
    }
  }

  private preloadAudioFallback(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(true);
      audio.onerror = () => resolve(false);
      audio.src = url;
    });
  }

  async getAnimationBuffer(url: string): Promise<ArrayBuffer | null> {
    const cache = await this.getSpriteCache();

    if (cache) {
      try {
        const cached = await cache.match(url);
        if (cached) {
          return cached.arrayBuffer();
        }
      } catch {
        // Fall through to fetch
      }
    }

    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const buffer = await response.arrayBuffer();

      if (cache) {
        try {
          await cache.put(url, new Response(buffer.slice(0)));
        } catch {
          // Cache put failed, continue anyway
        }
      }

      return buffer;
    } catch {
      return null;
    }
  }

  clearMetadata(): void {
    this.metadataMap.clear();
  }

  async clearCaches(): Promise<void> {
    this.metadataMap.clear();
    try {
      await caches.delete(this.config.spriteCacheName);
      await caches.delete(this.config.audioCacheName);
      this.spriteCache = null;
      this.audioCache = null;
    } catch {
      // Cache deletion failed
    }
  }
}
