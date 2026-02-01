import { AssetCache } from "./AssetCache";
import { UrlResolver } from "./UrlResolver";
import { PreloadManifest } from "./types";
import { ChatMsg } from "../viewport/interfaces/ChatMsg";
import calculatorHandler from "../utils/calculatorHandler";

export interface AssetPreloaderConfig {
  cache: AssetCache;
  resolver: UrlResolver;
  aoHost: string;
  emoteExtensions: string[];
  animationExtensions: string[];
}

const SHOUTS = [undefined, "holdit", "objection", "takethat", "custom"] as const;

export class AssetPreloader {
  private cache: AssetCache;
  private resolver: UrlResolver;
  private aoHost: string;
  private emoteExtensions: string[];
  private animationExtensions: string[];

  constructor(config: AssetPreloaderConfig) {
    this.cache = config.cache;
    this.resolver = config.resolver;
    this.aoHost = config.aoHost;
    this.emoteExtensions = config.emoteExtensions;
    this.animationExtensions = config.animationExtensions;
  }

  async preloadForMessage(chatmsg: ChatMsg): Promise<PreloadManifest> {
    const manifest: PreloadManifest = {
      mainCharIdleUrl: null,
      mainCharTalkingUrl: null,
      mainCharPreanimUrl: null,
      preanimDuration: 0,
      pairCharIdleUrl: null,
      shoutImageUrl: null,
      shoutSoundUrl: null,
      sfxUrl: null,
      blipUrl: null,
      effectUrl: null,
      allResolved: true,
      failedAssets: [],
    };

    const charFolder = `${this.aoHost}characters/`;
    const charName = chatmsg.name?.toLowerCase() ?? "";
    const emoteName = chatmsg.sprite?.toLowerCase() ?? "";
    const preanim = chatmsg.preanim?.toLowerCase() ?? "";
    const side = chatmsg.side ?? "";

    const resolutionPromises: Promise<void>[] = [];

    resolutionPromises.push(
      this.resolveMainCharIdle(charFolder, charName, emoteName, manifest),
    );

    resolutionPromises.push(
      this.resolveMainCharTalking(charFolder, charName, emoteName, manifest),
    );

    if (chatmsg.type === 1 && preanim && preanim !== "-") {
      resolutionPromises.push(
        this.resolveMainCharPreanim(charFolder, charName, preanim, manifest),
      );
    }

    if (chatmsg.other_name) {
      resolutionPromises.push(
        this.resolvePairChar(
          charFolder,
          chatmsg.other_name.toLowerCase(),
          chatmsg.other_emote?.toLowerCase() ?? "",
          manifest,
        ),
      );
    }

    if (chatmsg.objection && chatmsg.objection > 0 && chatmsg.objection <= 4) {
      resolutionPromises.push(
        this.resolveShout(charName, chatmsg.objection, manifest),
      );
    }

    resolutionPromises.push(this.resolveBlip(chatmsg.blips, manifest));

    if (
      chatmsg.sound &&
      chatmsg.sound !== "0" &&
      chatmsg.sound !== "1" &&
      chatmsg.sound !== ""
    ) {
      resolutionPromises.push(this.resolveSfx(chatmsg.sound, manifest));
    }

    const effectName = chatmsg.effects?.[0]?.toLowerCase() ?? "";
    const badEffects = ["", "-", "none"];
    if (effectName && !badEffects.includes(effectName) && !effectName.startsWith("rain")) {
      resolutionPromises.push(this.resolveEffect(effectName, manifest));
    }

    await Promise.all(resolutionPromises);

    manifest.allResolved = manifest.failedAssets.length === 0;

    const preloadPromises: Promise<void>[] = [];

    if (manifest.mainCharIdleUrl) {
      preloadPromises.push(
        this.cache.preloadImage(manifest.mainCharIdleUrl).then(() => {}),
      );
    }
    if (manifest.mainCharTalkingUrl) {
      preloadPromises.push(
        this.cache.preloadImage(manifest.mainCharTalkingUrl).then(() => {}),
      );
    }
    if (manifest.mainCharPreanimUrl) {
      preloadPromises.push(
        this.cache.preloadImage(manifest.mainCharPreanimUrl).then(() => {}),
      );
    }
    if (manifest.pairCharIdleUrl) {
      preloadPromises.push(
        this.cache.preloadImage(manifest.pairCharIdleUrl).then(() => {}),
      );
    }
    if (manifest.shoutImageUrl) {
      preloadPromises.push(
        this.cache.preloadImage(manifest.shoutImageUrl).then(() => {}),
      );
    }
    if (manifest.shoutSoundUrl) {
      preloadPromises.push(
        this.cache.preloadAudio(manifest.shoutSoundUrl).then(() => {}),
      );
    }
    if (manifest.sfxUrl) {
      preloadPromises.push(
        this.cache.preloadAudio(manifest.sfxUrl).then(() => {}),
      );
    }
    if (manifest.blipUrl) {
      preloadPromises.push(
        this.cache.preloadAudio(manifest.blipUrl).then(() => {}),
      );
    }

    await Promise.all(preloadPromises);

    return manifest;
  }

  private async resolveMainCharIdle(
    charFolder: string,
    charName: string,
    emoteName: string,
    manifest: PreloadManifest,
  ): Promise<void> {
    const result = await this.resolver.resolveEmoteUrl(
      charFolder,
      charName,
      emoteName,
      "(a)",
      this.emoteExtensions,
    );

    if (result) {
      manifest.mainCharIdleUrl = result.resolvedUrl;
    } else {
      manifest.failedAssets.push(`main-idle:${charName}/${emoteName}`);
    }
  }

  private async resolveMainCharTalking(
    charFolder: string,
    charName: string,
    emoteName: string,
    manifest: PreloadManifest,
  ): Promise<void> {
    const result = await this.resolver.resolveEmoteUrl(
      charFolder,
      charName,
      emoteName,
      "(b)",
      this.emoteExtensions,
    );

    if (result) {
      manifest.mainCharTalkingUrl = result.resolvedUrl;
    } else {
      manifest.failedAssets.push(`main-talking:${charName}/${emoteName}`);
    }
  }

  private async resolveMainCharPreanim(
    charFolder: string,
    charName: string,
    preanim: string,
    manifest: PreloadManifest,
  ): Promise<void> {
    const baseUrl = `${charFolder}${encodeURI(charName)}/${encodeURI(preanim)}`;

    const result = await this.resolver.resolveAnimationUrl(
      baseUrl,
      this.animationExtensions,
    );

    if (result) {
      manifest.mainCharPreanimUrl = result.resolvedUrl;

      const duration = await this.getAnimationDuration(result.resolvedUrl, result.extension);
      manifest.preanimDuration = duration;
    } else {
      manifest.failedAssets.push(`preanim:${charName}/${preanim}`);
    }
  }

  private async getAnimationDuration(url: string, extension: string): Promise<number> {
    const calculator = calculatorHandler[extension as keyof typeof calculatorHandler];
    if (!calculator) return 0;

    try {
      const buffer = await this.cache.getAnimationBuffer(url);
      if (!buffer) return 0;

      return calculator(buffer);
    } catch {
      return 0;
    }
  }

  private async resolvePairChar(
    charFolder: string,
    pairName: string,
    pairEmote: string,
    manifest: PreloadManifest,
  ): Promise<void> {
    const result = await this.resolver.resolveEmoteUrl(
      charFolder,
      pairName,
      pairEmote,
      "(a)",
      this.emoteExtensions,
    );

    if (result) {
      manifest.pairCharIdleUrl = result.resolvedUrl;
    } else {
      manifest.failedAssets.push(`pair-idle:${pairName}/${pairEmote}`);
    }
  }

  private async resolveShout(
    charName: string,
    objection: number,
    manifest: PreloadManifest,
  ): Promise<void> {
    const shout = SHOUTS[objection];
    if (!shout) return;

    if (objection === 4) {
      manifest.shoutImageUrl = `${this.aoHost}characters/${encodeURI(charName)}/custom.gif`;
    }

    const perCharPath = `${this.aoHost}characters/${encodeURI(charName)}/${shout}.opus`;
    const exists = await this.cache.checkExists(perCharPath);

    if (exists) {
      manifest.shoutSoundUrl = perCharPath;
    }
  }

  private async resolveBlip(
    blips: string,
    manifest: PreloadManifest,
  ): Promise<void> {
    if (!blips) return;

    const blipUrl = `${this.aoHost}sounds/blips/${encodeURI(blips.toLowerCase())}.opus`;
    const exists = await this.cache.checkExists(blipUrl);

    if (exists) {
      manifest.blipUrl = blipUrl;
    }
  }

  private async resolveSfx(
    sound: string,
    manifest: PreloadManifest,
  ): Promise<void> {
    const sfxUrl = `${this.aoHost}sounds/general/${encodeURI(sound.toLowerCase())}.opus`;
    const exists = await this.cache.checkExists(sfxUrl);

    if (exists) {
      manifest.sfxUrl = sfxUrl;
    } else {
      manifest.failedAssets.push(`sfx:${sound}`);
    }
  }

  private async resolveEffect(
    effectName: string,
    manifest: PreloadManifest,
  ): Promise<void> {
    const effectUrl = `${this.aoHost}themes/default/effects/${encodeURI(effectName)}.webp`;
    const exists = await this.cache.checkExists(effectUrl);

    if (exists) {
      manifest.effectUrl = effectUrl;
    }
  }
}
