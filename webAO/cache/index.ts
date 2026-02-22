import { AssetCache } from "./AssetCache";
import { UrlResolver } from "./UrlResolver";
import { AssetPreloader } from "./AssetPreloader";
import { AO_HOST } from "../client/aoHost";

export { AssetCache } from "./AssetCache";
export { UrlResolver } from "./UrlResolver";
export { AssetPreloader } from "./AssetPreloader";
export * from "./types";

export const assetCache = new AssetCache({
  spriteCacheName: "webao-sprites-v1",
  audioCacheName: "webao-audio-v1",
  metadataCacheName: "webao-metadata-v1",
});

export const urlResolver = new UrlResolver({
  cache: assetCache,
});

let assetPreloaderInstance: AssetPreloader | null = null;

export const getAssetPreloader = (
  emoteExtensions: string[],
  animationExtensions: string[] = [".gif", ".webp", ".apng"],
): AssetPreloader => {
  if (!assetPreloaderInstance) {
    assetPreloaderInstance = new AssetPreloader({
      cache: assetCache,
      resolver: urlResolver,
      aoHost: AO_HOST,
      emoteExtensions,
      animationExtensions,
    });
  }
  return assetPreloaderInstance;
};
