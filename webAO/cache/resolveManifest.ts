import fileExists from "../utils/fileExists";
import filesExist from "../utils/filesExist";
import { CharacterSpriteUrls, PreloadManifest } from "./types";
import { EmoteModifier, ShoutModifier } from "../packets/parseMSPacket";
import type { MSPacket } from "../packets/parseMSPacket";
import type { CharIni } from "../client/CharIni";
import { getShoutConfig } from "../viewport/constants/shouts";
import { positions, type Position } from "../viewport/positions";
import calculatorHandler from "../utils/calculatorHandler";
import { AO_HOST } from "../client/aoHost";
import { requestBuffer } from "../services/request.js";

function makeCharSpriteUrls(): CharacterSpriteUrls {
  return { idleUrl: null, talkingUrl: null, preanimUrl: null, preanimDuration: 0 };
}

/**
 * Resolves all asset URLs for an MS packet using fileExists probes.
 * Returns a PreloadManifest with resolved URLs (no Cache API preloading).
 */
export async function resolveManifest(
  packet: MSPacket,
  charIni: CharIni,
  bgName: string,
  emoteExtensions: string[],
  backgroundExtensions: string[],
): Promise<PreloadManifest> {
  const speakerSprites = makeCharSpriteUrls();
  const manifest: PreloadManifest = {
    characters: [speakerSprites],
    shoutImageUrl: null,
    shoutSoundUrl: null,
    sfxUrl: null,
    blipUrl: null,
    effectUrl: null,
    backgroundUrl: null,
    deskUrl: null,
    speedLinesUrl: null,
    allResolved: true,
    failedAssets: [],
  };

  const charFolder = `${AO_HOST}characters/`;
  const charName = packet.charName.toLowerCase();
  const emoteName = packet.emote.toLowerCase();
  const preanim = packet.preanim.toLowerCase();

  const resolutionPromises: Promise<void>[] = [];

  resolutionPromises.push(
    resolveCharIdle(charFolder, charName, emoteName, emoteExtensions, speakerSprites),
  );

  resolutionPromises.push(
    resolveCharTalking(charFolder, charName, emoteName, emoteExtensions, speakerSprites),
  );

  if (packet.emoteModifier === EmoteModifier.PreanimWithSfx && preanim && preanim !== "-") {
    resolutionPromises.push(
      resolveCharPreanim(charFolder, charName, preanim, speakerSprites),
    );
  }

  if (packet.otherName) {
    const pairedSprites = makeCharSpriteUrls();
    manifest.characters.push(pairedSprites);
    resolutionPromises.push(
      resolveCharIdle(
        charFolder,
        packet.otherName.toLowerCase(),
        packet.otherEmote.toLowerCase(),
        emoteExtensions,
        pairedSprites,
      ),
    );
  }

  if (packet.shoutModifier !== ShoutModifier.None && packet.shoutModifier <= ShoutModifier.Custom) {
    resolutionPromises.push(
      resolveShout(charName, packet.shoutModifier, manifest),
    );
  }

  resolutionPromises.push(resolveBlip(charIni.blips, manifest));

  if (
    packet.sfx &&
    packet.sfx !== "0" &&
    packet.sfx !== "1" &&
    packet.sfx !== ""
  ) {
    resolutionPromises.push(resolveSfx(packet.sfx, manifest));
  }

  const effectName = packet.effects[0]?.toLowerCase() ?? "";
  const badEffects = ["", "-", "none"];
  if (effectName && !badEffects.includes(effectName) && !effectName.startsWith("rain")) {
    resolutionPromises.push(resolveEffect(effectName, manifest));
  }

  resolutionPromises.push(
    resolveBackgroundAssets(packet.side, bgName, backgroundExtensions, manifest),
  );

  await Promise.all(resolutionPromises);

  manifest.allResolved = manifest.failedAssets.length === 0;

  return manifest;
}

// ─── Resolution helpers ──────────────────────────────

async function resolveCharIdle(
  charFolder: string,
  charName: string,
  emoteName: string,
  extensions: string[],
  char: CharacterSpriteUrls,
): Promise<void> {
  const url = await resolveEmoteUrl(charFolder, charName, emoteName, "(a)", extensions);
  if (url) char.idleUrl = url;
}

async function resolveCharTalking(
  charFolder: string,
  charName: string,
  emoteName: string,
  extensions: string[],
  char: CharacterSpriteUrls,
): Promise<void> {
  const url = await resolveEmoteUrl(charFolder, charName, emoteName, "(b)", extensions);
  if (url) char.talkingUrl = url;
}

async function resolveCharPreanim(
  charFolder: string,
  charName: string,
  preanim: string,
  char: CharacterSpriteUrls,
): Promise<void> {
  const baseUrl = `${charFolder}${encodeURI(charName)}/${encodeURI(preanim)}`;
  const animExtensions = [".gif", ".webp", ".apng"];

  const urls = animExtensions.map((ext) => `${baseUrl}${ext}`);
  const found = await filesExist(urls);

  if (found) {
    char.preanimUrl = found;
    const ext = animExtensions[urls.indexOf(found)];
    char.preanimDuration = await getAnimationDuration(found, ext);
  }
}

async function getAnimationDuration(url: string, extension: string): Promise<number> {
  const calculator = calculatorHandler[extension as keyof typeof calculatorHandler];
  if (!calculator) return 0;

  try {
    const buffer = await requestBuffer(url);
    if (!buffer) return 0;
    return calculator(buffer);
  } catch {
    return 0;
  }
}

async function resolveShout(
  charName: string,
  modifier: ShoutModifier,
  manifest: PreloadManifest,
): Promise<void> {
  const result = getShoutConfig(modifier);
  if (!result) return;

  if (modifier === ShoutModifier.Custom) {
    manifest.shoutImageUrl = `${AO_HOST}characters/${encodeURI(charName)}/custom.gif`;
  }

  const perCharPath = `${AO_HOST}characters/${encodeURI(charName)}/${result.name}.opus`;
  if (await fileExists(perCharPath)) {
    manifest.shoutSoundUrl = perCharPath;
  }
}

async function resolveBlip(
  blips: string,
  manifest: PreloadManifest,
): Promise<void> {
  if (!blips) return;

  const blipUrl = `${AO_HOST}sounds/blips/${encodeURI(blips.toLowerCase())}.opus`;
  if (await fileExists(blipUrl)) {
    manifest.blipUrl = blipUrl;
  }
}

async function resolveSfx(
  sound: string,
  manifest: PreloadManifest,
): Promise<void> {
  const sfxUrl = `${AO_HOST}sounds/general/${encodeURI(sound.toLowerCase())}.opus`;
  if (await fileExists(sfxUrl)) {
    manifest.sfxUrl = sfxUrl;
  } else {
    manifest.failedAssets.push(`sfx:${sound}`);
  }
}

async function resolveEffect(
  effectName: string,
  manifest: PreloadManifest,
): Promise<void> {
  const effectUrl = `${AO_HOST}themes/default/effects/${encodeURI(effectName)}.webp`;
  if (await fileExists(effectUrl)) {
    manifest.effectUrl = effectUrl;
  }
}

async function resolveBackgroundAssets(
  side: string,
  bgName: string,
  backgroundExtensions: string[],
  manifest: PreloadManifest,
): Promise<void> {
  let bg: string;
  let desk: { ao2?: string; ao1?: string } | undefined;
  let speedLines: string;

  if (side in positions) {
    const pos = positions[side as Position];
    bg = pos.bg ?? side;
    desk = pos.desk;
    speedLines = pos.speedLines;
  } else {
    bg = side;
    desk = { ao2: `${side}_overlay.png`, ao1: "_overlay.png" };
    speedLines = "defense_speedlines.gif";
  }

  manifest.speedLinesUrl = `${AO_HOST}themes/default/${encodeURI(speedLines)}`;

  await Promise.all([
    resolveBackground(bgName, bg, backgroundExtensions, manifest),
    resolveDesk(bgName, desk, manifest),
  ]);
}

async function resolveBackground(
  bgName: string,
  positionBg: string,
  backgroundExtensions: string[],
  manifest: PreloadManifest,
): Promise<void> {
  const bgFolder = `${AO_HOST}background/${encodeURI(bgName.toLowerCase())}/`;
  const urls = backgroundExtensions.map((ext) => `${bgFolder}${positionBg}${ext}`);
  const found = await filesExist(urls);
  if (found) {
    manifest.backgroundUrl = found;
  }
}

async function resolveDesk(
  bgName: string,
  desk: { ao2?: string; ao1?: string } | undefined,
  manifest: PreloadManifest,
): Promise<void> {
  if (!desk) return;

  const bgFolder = `${AO_HOST}background/${encodeURI(bgName.toLowerCase())}/`;

  if (desk.ao2) {
    const url = `${bgFolder}${desk.ao2}`;
    if (await fileExists(url)) {
      manifest.deskUrl = url;
      return;
    }
  }

  if (desk.ao1) {
    const url = `${bgFolder}${desk.ao1}`;
    if (await fileExists(url)) {
      manifest.deskUrl = url;
    }
  }
}

// ─── Emote URL resolution ────────────────────────────

async function resolveEmoteUrl(
  characterFolder: string,
  characterName: string,
  emoteName: string,
  prefix: string,
  extensions: string[],
): Promise<string | null> {
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

    if (await fileExists(url)) {
      return url;
    }
  }

  return null;
}
