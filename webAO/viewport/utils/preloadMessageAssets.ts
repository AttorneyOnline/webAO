import { ChatMsg } from "../interfaces/ChatMsg";
import { PreloadedAssets } from "../interfaces/PreloadedAssets";
import {
  resolveAndPreloadImage,
  resolveAndPreloadAudio,
  getAnimDuration,
} from "../../utils/assetCache";
import transparentPng from "../../constants/transparentPng";

const GLOBAL_TIMEOUT_MS = 8000;

/**
 * Builds the list of candidate URLs for a character emote across all extensions.
 * Replicates the URL construction logic from setEmote.ts.
 */
function buildEmoteUrls(
  AO_HOST: string,
  extensions: string[],
  charactername: string,
  emotename: string,
  prefix: string,
): string[] {
  const characterFolder = `${AO_HOST}characters/`;
  const urls: string[] = [];

  for (const extension of extensions) {
    let url: string;
    if (extension === ".png") {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(emotename)}${extension}`;
    } else if (extension === ".webp.static") {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(emotename)}.webp`;
    } else {
      url = `${characterFolder}${encodeURI(charactername)}/${encodeURI(prefix)}${encodeURI(emotename)}${extension}`;
    }
    urls.push(url);
  }

  return urls;
}

const DEFAULT_ASSETS: PreloadedAssets = {
  idleUrl: transparentPng,
  talkingUrl: transparentPng,
  preanimUrl: transparentPng,
  preanimDuration: 0,
  pairIdleUrl: transparentPng,
  shoutSfxUrl: null,
  shoutBubbleUrl: null,
  emoteSfxUrl: null,
  realizationSfxUrl: null,
  stabSfxUrl: null,
};

const SHOUT_BUBBLE_EXTENSIONS = [".webp", ".gif", ".apng", ".png"];

/**
 * Builds candidate URLs for a shout bubble, trying the per-character
 * override first (in multiple extensions) then the default in misc/default/.
 *
 * For custom shouts (objection === 4), only the per-character `custom.<ext>`
 * paths are tried — there is no default custom bubble.
 */
function buildShoutBubbleUrls(
  AO_HOST: string,
  charName: string,
  shoutName: string,
  isCustom: boolean,
): string[] {
  const urls: string[] = [];
  const baseName = isCustom ? "custom" : `${shoutName}_bubble`;
  const charPath = `${AO_HOST}characters/${encodeURI(charName)}/`;
  for (const ext of SHOUT_BUBBLE_EXTENSIONS) {
    urls.push(`${charPath}${baseName}${ext}`);
  }
  if (!isCustom) {
    urls.push(`${AO_HOST}misc/default/${baseName}.png`);
  }
  return urls;
}

/**
 * Preloads all assets referenced in an IC message before the animation timeline starts.
 * Resolves all file extensions in parallel and primes the browser cache.
 * All resolution and preloading is cached via assetCache, so repeated messages
 * from the same character with the same emotes resolve near-instantly.
 */
export default async function preloadMessageAssets(
  chatmsg: ChatMsg,
  AO_HOST: string,
  emoteExtensions: string[],
): Promise<PreloadedAssets> {
  const charName = chatmsg.name!.toLowerCase();
  const charEmote = chatmsg.sprite!.toLowerCase();

  const doPreload = async (): Promise<PreloadedAssets> => {
    // Build candidate URL lists for each emote
    const idleUrls = buildEmoteUrls(AO_HOST, emoteExtensions, charName, charEmote, "(a)");
    const talkingUrls = buildEmoteUrls(AO_HOST, emoteExtensions, charName, charEmote, "(b)");

    const hasPreanim =
      chatmsg.type === 1 &&
      chatmsg.preanim &&
      chatmsg.preanim !== "-" &&
      chatmsg.preanim !== "";

    const preanimUrls = hasPreanim
      ? buildEmoteUrls(AO_HOST, emoteExtensions, charName, chatmsg.preanim!.toLowerCase(), "")
      : null;

    const hasPair = !!chatmsg.other_name;
    const pairIdleUrls = hasPair
      ? buildEmoteUrls(AO_HOST, emoteExtensions, chatmsg.other_name!.toLowerCase(), chatmsg.other_emote!.toLowerCase(), "(a)")
      : null;

    // Shout SFX per-character path
    const shoutNames = [undefined, "holdit", "objection", "takethat", "custom"];
    const shoutName = shoutNames[chatmsg.objection];
    const shoutSfxPath = (chatmsg.objection > 0 && chatmsg.objection < 4 && shoutName)
      ? `${AO_HOST}characters/${encodeURI(charName)}/${shoutName}.opus`
      : null;

    // Shout bubble: try per-character override first (multiple extensions),
    // then fall back to misc/default/<name>_bubble.png. Custom shouts have
    // no default — only per-character custom.<ext>.
    const shoutBubbleUrls = (chatmsg.objection > 0 && chatmsg.objection <= 4 && shoutName)
      ? buildShoutBubbleUrls(AO_HOST, charName, shoutName, chatmsg.objection === 4)
      : null;

    // Emote SFX
    const invalidSounds = ["0", "1", "", undefined];
    const emoteSfxPath = (
      !invalidSounds.includes(chatmsg.sound) &&
      (chatmsg.type == 1 || chatmsg.type == 2 || chatmsg.type == 6)
    ) ? `${AO_HOST}sounds/general/${encodeURI(chatmsg.sound.toLowerCase())}.opus`
      : null;

    // Realization and stab SFX (always preloaded - used by \f and \s text commands)
    const realizationPath = `${AO_HOST}sounds/general/sfx-realization.opus`;
    const stabPath = `${AO_HOST}sounds/general/sfx-stab.opus`;

    // Launch everything in parallel - assetCache handles per-URL dedup and caching
    const [
      idleUrl, talkingUrl, preanimUrl, preanimDuration, pairIdleUrl,
      shoutSfxUrl, shoutBubbleResolved, emoteSfxUrl, realizationSfxUrl, stabSfxUrl,
    ] = await Promise.all([
      resolveAndPreloadImage(idleUrls),
      resolveAndPreloadImage(talkingUrls),
      preanimUrls ? resolveAndPreloadImage(preanimUrls) : Promise.resolve(transparentPng),
      hasPreanim
        ? getAnimDuration(`${AO_HOST}characters/${encodeURI(charName)}/${encodeURI(chatmsg.preanim!.toLowerCase())}`)
        : Promise.resolve(0),
      pairIdleUrls ? resolveAndPreloadImage(pairIdleUrls) : Promise.resolve(transparentPng),
      shoutSfxPath ? resolveAndPreloadAudio(shoutSfxPath) : Promise.resolve(null),
      shoutBubbleUrls ? resolveAndPreloadImage(shoutBubbleUrls) : Promise.resolve(null),
      emoteSfxPath ? resolveAndPreloadAudio(emoteSfxPath) : Promise.resolve(null),
      resolveAndPreloadAudio(realizationPath),
      resolveAndPreloadAudio(stabPath),
    ]);

    // resolveAndPreloadImage falls back to transparentPng when nothing exists;
    // treat that as "no bubble found" so the caller can decide what to do.
    const shoutBubbleUrl = shoutBubbleResolved && shoutBubbleResolved !== transparentPng
      ? shoutBubbleResolved
      : null;

    return {
      idleUrl,
      talkingUrl,
      preanimUrl,
      preanimDuration,
      pairIdleUrl,
      shoutSfxUrl,
      shoutBubbleUrl,
      emoteSfxUrl,
      realizationSfxUrl,
      stabSfxUrl,
    };
  };

  // Race against global timeout for graceful degradation
  const timeoutPromise = new Promise<PreloadedAssets>((resolve) => {
    setTimeout(() => {
      console.warn("Asset preloading timed out, using defaults");
      resolve({ ...DEFAULT_ASSETS });
    }, GLOBAL_TIMEOUT_MS);
  });

  try {
    return await Promise.race([doPreload(), timeoutPromise]);
  } catch (error) {
    console.error("Asset preloading failed:", error);
    return { ...DEFAULT_ASSETS };
  }
}
