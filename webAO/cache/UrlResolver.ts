import { AssetCache } from "./AssetCache";
import { ResolvedUrl } from "./types";

export interface UrlResolverConfig {
  cache: AssetCache;
}

export class UrlResolver {
  private cache: AssetCache;
  private pendingResolutions: Map<string, Promise<ResolvedUrl | null>>;

  constructor(config: UrlResolverConfig) {
    this.cache = config.cache;
    this.pendingResolutions = new Map();
  }

  async resolveEmoteUrl(
    characterFolder: string,
    characterName: string,
    emoteName: string,
    prefix: string,
    extensions: string[],
  ): Promise<ResolvedUrl | null> {
    const baseKey = `${characterFolder}|${characterName}|${emoteName}|${prefix}`;

    const pending = this.pendingResolutions.get(baseKey);
    if (pending) {
      return pending;
    }

    const resolution = this.doResolveEmoteUrl(
      characterFolder,
      characterName,
      emoteName,
      prefix,
      extensions,
    );

    this.pendingResolutions.set(baseKey, resolution);

    try {
      return await resolution;
    } finally {
      this.pendingResolutions.delete(baseKey);
    }
  }

  private async doResolveEmoteUrl(
    characterFolder: string,
    characterName: string,
    emoteName: string,
    prefix: string,
    extensions: string[],
  ): Promise<ResolvedUrl | null> {
    const encodedChar = encodeURI(characterName);
    const encodedEmote = encodeURI(emoteName);
    const encodedPrefix = encodeURI(prefix);

    for (const extension of extensions) {
      let url: string;

      if (extension === ".png") {
        url = `${characterFolder}${encodedChar}/${encodedEmote}${extension}`;
      } else if (extension === ".webp.static") {
        url = `${characterFolder}${encodedChar}/${encodedEmote}.webp`;
      } else {
        url = `${characterFolder}${encodedChar}/${encodedPrefix}${encodedEmote}${extension}`;
      }

      const cached = this.cache.getMetadata(url);
      if (cached !== undefined) {
        if (cached.exists) {
          return {
            baseUrl: `${characterFolder}${encodedChar}/${encodedEmote}`,
            resolvedUrl: url,
            extension,
          };
        }
        continue;
      }

      const exists = await this.cache.checkExists(url);
      if (exists) {
        return {
          baseUrl: `${characterFolder}${encodedChar}/${encodedEmote}`,
          resolvedUrl: url,
          extension,
        };
      }
    }

    return null;
  }

  async resolveAnimationUrl(
    baseUrl: string,
    extensions: string[],
  ): Promise<ResolvedUrl | null> {
    const baseKey = `anim|${baseUrl}`;

    const pending = this.pendingResolutions.get(baseKey);
    if (pending) {
      return pending;
    }

    const resolution = this.doResolveAnimationUrl(baseUrl, extensions);

    this.pendingResolutions.set(baseKey, resolution);

    try {
      return await resolution;
    } finally {
      this.pendingResolutions.delete(baseKey);
    }
  }

  private async doResolveAnimationUrl(
    baseUrl: string,
    extensions: string[],
  ): Promise<ResolvedUrl | null> {
    for (const extension of extensions) {
      const url = `${baseUrl}${extension}`;

      const cached = this.cache.getMetadata(url);
      if (cached !== undefined) {
        if (cached.exists) {
          return {
            baseUrl,
            resolvedUrl: url,
            extension,
          };
        }
        continue;
      }

      const exists = await this.cache.checkExists(url);
      if (exists) {
        return {
          baseUrl,
          resolvedUrl: url,
          extension,
        };
      }
    }

    return null;
  }

  async resolveSoundUrl(
    basePath: string,
    soundName: string,
    extension: string = ".opus",
  ): Promise<string | null> {
    const url = `${basePath}${encodeURI(soundName)}${extension}`;

    const cached = this.cache.getMetadata(url);
    if (cached !== undefined) {
      return cached.exists ? url : null;
    }

    const exists = await this.cache.checkExists(url);
    return exists ? url : null;
  }

  async resolveEffectUrl(
    effectsFolder: string,
    effectName: string,
    extension: string = ".webp",
  ): Promise<string | null> {
    const url = `${effectsFolder}${encodeURI(effectName)}${extension}`;

    const cached = this.cache.getMetadata(url);
    if (cached !== undefined) {
      return cached.exists ? url : null;
    }

    const exists = await this.cache.checkExists(url);
    return exists ? url : null;
  }
}
