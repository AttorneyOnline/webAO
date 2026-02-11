export interface CachedAssetMetadata {
  exists: boolean;
  resolvedUrl: string | null;
  animationDuration?: number;
  cachedAt: number;
}

export interface ResolvedUrl {
  baseUrl: string;
  resolvedUrl: string;
  extension: string;
}

export interface PreloadManifest {
  mainCharIdleUrl: string | null;
  mainCharTalkingUrl: string | null;
  mainCharPreanimUrl: string | null;
  preanimDuration: number;
  pairCharIdleUrl: string | null;
  shoutImageUrl: string | null;
  shoutSoundUrl: string | null;
  sfxUrl: string | null;
  blipUrl: string | null;
  effectUrl: string | null;
  allResolved: boolean;
  failedAssets: string[];
}
