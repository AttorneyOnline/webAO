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

export interface CharacterSpriteUrls {
  idleUrl: string | null;
  talkingUrl: string | null;
  preanimUrl: string | null;
  preanimDuration: number;
}

export interface PreloadManifest {
  characters: CharacterSpriteUrls[];
  shoutImageUrl: string | null;
  shoutSoundUrl: string | null;
  sfxUrl: string | null;
  blipUrl: string | null;
  effectUrl: string | null;
  backgroundUrl: string | null;
  deskUrl: string | null;
  speedLinesUrl: string | null;
  allResolved: boolean;
  failedAssets: string[];
}
