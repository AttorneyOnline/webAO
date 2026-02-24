import { AssetCache } from "./AssetCache";
import { UrlResolver } from "./UrlResolver";
import { CharacterSpriteUrls, PreloadManifest } from "./types";
import { ChatMsg } from "../viewport/interfaces/ChatMsg";
import calculatorHandler from "../utils/calculatorHandler";

export interface AssetPreloaderConfig {
  cache: AssetCache;
  resolver: UrlResolver;
  aoHost: string;
  emoteExtensions: string[];
  animationExtensions: string[];
}

const SHOUTS: readonly [undefined, "holdit", "objection", "takethat", "custom"] = [undefined, "holdit", "objection", "takethat", "custom"] as const;

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

  private makeCharSpriteUrls(): CharacterSpriteUrls {
    return { idleUrl: null, talkingUrl: null, preanimUrl: null, preanimDuration: 0 };
  }

  async preloadForMessage(chatmsg: ChatMsg): Promise<PreloadManifest> {
    const speakerSprites = this.makeCharSpriteUrls();
    const manifest: PreloadManifest = {
      characters: [speakerSprites],
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
      this.resolveCharIdle(charFolder, charName, emoteName, speakerSprites),
    );

    resolutionPromises.push(
      this.resolveCharTalking(charFolder, charName, emoteName, speakerSprites),
    );

    if (chatmsg.type === 1 && preanim && preanim !== "-") {
      resolutionPromises.push(
        this.resolveCharPreanim(charFolder, charName, preanim, speakerSprites),
      );
    }

    if (chatmsg.other_name) {
      const pairedSprites = this.makeCharSpriteUrls();
      manifest.characters.push(pairedSprites);
      resolutionPromises.push(
        this.resolveCharIdle(
          charFolder,
          chatmsg.other_name.toLowerCase(),
          chatmsg.other_emote?.toLowerCase() ?? "",
          pairedSprites,
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

    for (const char of manifest.characters) {
      if (char.idleUrl) {
        preloadPromises.push(
          this.cache.preloadImage(char.idleUrl).then(() => {}),
        );
      }
      if (char.talkingUrl) {
        preloadPromises.push(
          this.cache.preloadImage(char.talkingUrl).then(() => {}),
        );
      }
      if (char.preanimUrl) {
        preloadPromises.push(
          this.cache.preloadImage(char.preanimUrl).then(() => {}),
        );
      }
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

  private async resolveCharIdle(
    charFolder: string,
    charName: string,
    emoteName: string,
    char: CharacterSpriteUrls,
  ): Promise<void> {
    const result = await this.resolver.resolveEmoteUrl(
      charFolder,
      charName,
      emoteName,
      "(a)",
      this.emoteExtensions,
    );

    if (result) {
      char.idleUrl = result.resolvedUrl;
    } else {
      // failedAssets is tracked on the manifest, caller handles
    }
  }

  private async resolveCharTalking(
    charFolder: string,
    charName: string,
    emoteName: string,
    char: CharacterSpriteUrls,
  ): Promise<void> {
    const result = await this.resolver.resolveEmoteUrl(
      charFolder,
      charName,
      emoteName,
      "(b)",
      this.emoteExtensions,
    );

    if (result) {
      char.talkingUrl = result.resolvedUrl;
    }
  }

  private async resolveCharPreanim(
    charFolder: string,
    charName: string,
    preanim: string,
    char: CharacterSpriteUrls,
  ): Promise<void> {
    const baseUrl = `${charFolder}${encodeURI(charName)}/${encodeURI(preanim)}`;

    const result = await this.resolver.resolveAnimationUrl(
      baseUrl,
      this.animationExtensions,
    );

    if (result) {
      char.preanimUrl = result.resolvedUrl;

      const duration = await this.getAnimationDuration(result.resolvedUrl, result.extension);
      char.preanimDuration = duration;
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
