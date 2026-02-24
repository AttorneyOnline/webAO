import { DeskMod, EmoteModifier, ShoutModifier, TextColor, textColorName } from "../packets/parseMSPacket";
import type { MSPacket, TextColorName } from "../packets/parseMSPacket";
import type { CharIni } from "../client/CharIni";
import type { PreloadManifest } from "../cache/types";
import type {
  RenderSequence,
  CharacterTimeline,
  RenderStep,
  TextDisplay,
  TextSegment,
  TextRun,
  InlineEffect,
  SegmentColor,
  ShoutPhase,
  SlidePhase,
  PositionLayout,
  ChatboxDisplay,
  EvidenceDisplay,
  InitialEffects,
  OverlayEffect,
  SfxConfig,
  ParsedFrameEffects,
} from "./interfaces/RenderSequence";
import { getShoutConfig } from "./constants/shouts";

// ─── AOML Rules ──────────────────────────────────────

export interface AomlRule {
  start: string;
  end: string;
  color: [number, number, number];
  remove: boolean;
}

export interface AomlRules {
  byStart: Map<string, AomlRule>;
  byEnd: Map<string, AomlRule>;
}

export function parseAomlRules(iniContent: string): AomlRules {
  const byStart = new Map<string, AomlRule>();
  const byEnd = new Map<string, AomlRule>();

  let currentHeader = "";
  let currentEntry: Partial<AomlRule & { colorRaw: string }> = {};

  for (const line of iniContent.split(/\r?\n/)) {
    if (line === "") {
      if (currentHeader && currentEntry.start && currentEntry.end && currentEntry.colorRaw) {
        const parts = currentEntry.colorRaw.split(",").map(Number);
        const rule: AomlRule = {
          start: currentEntry.start,
          end: currentEntry.end,
          color: [parts[0] || 0, parts[1] || 0, parts[2] || 0],
          remove: currentEntry.remove ?? false,
        };
        byStart.set(rule.start, rule);
        byEnd.set(rule.end, rule);
      }
      currentHeader = "";
      currentEntry = {};
      continue;
    }

    const eqIdx = line.indexOf(" = ");
    if (eqIdx === -1) continue;
    const key = line.substring(0, eqIdx);
    const value = line.substring(eqIdx + 3);

    if (currentHeader === "") {
      currentHeader = key;
      currentEntry.colorRaw = value;
    } else {
      const field = key.split("_")[1];
      switch (field) {
        case "start":
          currentEntry.start = value;
          break;
        case "end":
          currentEntry.end = value;
          break;
        case "remove":
          currentEntry.remove = Number(value) !== 0;
          break;
      }
    }
  }

  // Flush last entry if file doesn't end with blank line
  if (currentHeader && currentEntry.start && currentEntry.end && currentEntry.colorRaw) {
    const parts = currentEntry.colorRaw.split(",").map(Number);
    const rule: AomlRule = {
      start: currentEntry.start,
      end: currentEntry.end,
      color: [parts[0] || 0, parts[1] || 0, parts[2] || 0],
      remove: currentEntry.remove ?? false,
    };
    byStart.set(rule.start, rule);
    byEnd.set(rule.end, rule);
  }

  return { byStart, byEnd };
}

// ─── Sub-builders ────────────────────────────────────

function parseFrameEffects(
  screenshakeStr: string,
  realizationStr: string,
  sfxStr: string,
): ParsedFrameEffects {
  const parse = (s: string): readonly number[] => {
    if (!s || s === "") return [];
    return s.split(",").filter(Boolean).map(Number);
  };
  return {
    screenshakeFrames: parse(screenshakeStr),
    realizationFrames: parse(realizationStr),
    sfxFrames: parse(sfxStr),
  };
}

function buildCharacterTimelines(
  packet: MSPacket,
  manifest: PreloadManifest,
  resolvedSfx: string,
): CharacterTimeline[] {
  const timelines: CharacterTimeline[] = [];

  // Main character
  const mainSprites = manifest.characters[0];
  const hasPreanim =
    packet.emoteModifier === EmoteModifier.PreanimWithSfx &&
    packet.preanim &&
    packet.preanim !== "-" &&
    packet.preanim !== "";

  const mainSteps: RenderStep[] = [];

  // Build SFX config for the final step
  let sfxConfig: SfxConfig | null = null;
  if (
    manifest.sfxUrl &&
    resolvedSfx !== "0" &&
    resolvedSfx !== "1" &&
    resolvedSfx !== "" &&
    (packet.emoteModifier === EmoteModifier.PreanimWithSfx ||
     packet.emoteModifier === EmoteModifier.PreanimWithObjection ||
     packet.emoteModifier === EmoteModifier.PreanimZoom)
  ) {
    sfxConfig = {
      path: manifest.sfxUrl,
      delayMs: packet.sfxDelay || 0,
      loop: packet.sfxLooping,
    };
  }

  if (hasPreanim && mainSprites?.preanimUrl) {
    // Preanim step
    mainSteps.push({
      sprite: mainSprites.preanimUrl,
      talking: null,
      durationMs: mainSprites.preanimDuration || 0,
      nonInterrupting: packet.nonInterruptingPreanim,
      sfx: null,
    });
  }

  // Final step (idle/talking)
  // Blue text disables talking animation — character stays on idle sprite
  const talkingSprite = packet.textColor === TextColor.Blue
    ? null
    : mainSprites?.talkingUrl ?? null;

  mainSteps.push({
    sprite: mainSprites?.idleUrl ?? "",
    talking: talkingSprite,
    durationMs: null,
    nonInterrupting: false,
    sfx: sfxConfig,
  });

  timelines.push({
    steps: mainSteps,
    flip: packet.flip,
    offset: packet.selfOffset,
    frameEffects: parseFrameEffects(
      packet.frameScreenshake,
      packet.frameRealization,
      packet.frameSfx,
    ),
  });

  // Pair character
  if (packet.otherName) {
    const pairSprites = manifest.characters[1];
    timelines.push({
      steps: [
        {
          sprite: pairSprites?.idleUrl ?? "",
          talking: null,
          durationMs: null,
          nonInterrupting: false,
          sfx: null,
        },
      ],
      flip: packet.otherFlip,
      offset: packet.otherOffset,
      frameEffects: { screenshakeFrames: [], realizationFrames: [], sfxFrames: [] },
    });
  }

  return timelines;
}

function buildTextDisplay(
  content: string,
  colorIndex: TextColor,
  aomlRules: AomlRules,
  baseTickMs: number,
  blipUrl: string,
  additive: boolean,
): TextDisplay {
  let centered = false;
  let text = content;

  // Detect centered text prefix
  if (text.startsWith("~~")) {
    centered = true;
    text = text.substring(2);
  }

  const defaultColorName = textColorName(colorIndex);
  const defaultColor: SegmentColor = { kind: "named", name: defaultColorName };

  const segments: TextSegment[] = [];
  let tickMs = baseTickMs;
  const MAX_SLOW_CHATSPEED = 120;

  // Color stack for AOML
  const colorStack: SegmentColor[] = [];
  const closingStack: string[] = [];

  // Accumulator for current text run
  let runContent = "";
  let runColor: SegmentColor = colorStack.length > 0 ? colorStack[colorStack.length - 1] : defaultColor;
  let runTickMs = tickMs;

  const flushRun = () => {
    if (runContent.length > 0) {
      segments.push({
        kind: "text",
        content: runContent,
        color: runColor,
        tickMs: runTickMs,
      });
      runContent = "";
    }
  };

  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    // Speed modifiers
    if (ch === "{") {
      flushRun();
      tickMs = Math.min(tickMs + 20, MAX_SLOW_CHATSPEED);
      runTickMs = tickMs;
      i++;
      continue;
    }
    if (ch === "}") {
      flushRun();
      tickMs = Math.max(tickMs - 20, 0);
      runTickMs = tickMs;
      i++;
      continue;
    }

    // Inline effects: \s = screenshake, \f = realization
    if (ch === "\\" && i + 1 < text.length) {
      const next = text[i + 1];
      if (next === "s") {
        flushRun();
        segments.push({ kind: "screenshake" });
        i += 2;
        continue;
      }
      if (next === "f") {
        flushRun();
        segments.push({ kind: "realization" });
        i += 2;
        continue;
      }
    }

    // AOML end marker check (must come before start check to handle same-char start/end)
    const currentClosing = closingStack.length > 0 ? closingStack[closingStack.length - 1] : null;
    if (currentClosing === ch) {
      const rule = aomlRules.byEnd.get(ch);
      flushRun();
      closingStack.pop();
      colorStack.pop();
      runColor = colorStack.length > 0 ? colorStack[colorStack.length - 1] : defaultColor;
      if (rule && !rule.remove) {
        runContent += ch;
      }
      i++;
      continue;
    }

    // AOML start marker
    const startRule = aomlRules.byStart.get(ch);
    if (startRule) {
      flushRun();
      const rgb = startRule.color;
      const newColor: SegmentColor = { kind: "rgb", r: rgb[0], g: rgb[1], b: rgb[2] };
      colorStack.push(newColor);
      closingStack.push(startRule.end);
      runColor = newColor;
      if (!startRule.remove) {
        runContent += ch;
      }
      i++;
      continue;
    }

    // Normal character - check if color/speed changed
    const currentColor = colorStack.length > 0 ? colorStack[colorStack.length - 1] : defaultColor;
    if (runContent.length > 0 && (tickMs !== runTickMs || !colorsEqual(currentColor, runColor))) {
      flushRun();
      runColor = currentColor;
      runTickMs = tickMs;
    }
    runColor = currentColor;
    runTickMs = tickMs;
    runContent += ch;
    i++;
  }

  flushRun();

  return {
    segments,
    centered,
    additive,
    blipSound: blipUrl,
  };
}

function colorsEqual(a: SegmentColor, b: SegmentColor): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === "named" && b.kind === "named") return a.name === b.name;
  if (a.kind === "rgb" && b.kind === "rgb") return a.r === b.r && a.g === b.g && a.b === b.b;
  return false;
}

function buildShoutPhase(
  packet: MSPacket,
  manifest: PreloadManifest,
  aoHost: string,
): ShoutPhase | null {
  const result = getShoutConfig(packet.shoutModifier);
  if (!result) return null;

  const { config } = result;

  if (packet.shoutModifier === ShoutModifier.Custom) {
    return {
      image: manifest.shoutImageUrl ??
        `${aoHost}characters/${encodeURI(packet.charName.toLowerCase())}/custom.gif`,
      sound: manifest.shoutSoundUrl ?? "",
      durationMs: config.duration,
      isCustom: true,
    };
  }

  return {
    image: manifest.shoutImageUrl ?? `${aoHost}${config.image}`,
    sound: manifest.shoutSoundUrl ?? `${aoHost}${config.sfx}`,
    durationMs: config.duration,
    isCustom: false,
  };
}

function buildPositionLayout(packet: MSPacket, manifest: PreloadManifest): PositionLayout {
  const side = packet.side;
  const deskmod = packet.deskMod;
  const emoteModifier = packet.emoteModifier;

  const useFullView = ["def", "pro", "wit"].includes(side);
  const showSpeedlines =
    emoteModifier === EmoteModifier.Zoom || emoteModifier === EmoteModifier.PreanimZoom;

  let deskDuringPreanim: boolean;
  let deskDuringSpeaking: boolean;
  let skipOffset = false;

  if (showSpeedlines) {
    deskDuringPreanim = false;
    deskDuringSpeaking = false;
  } else {
    switch (deskmod) {
      case DeskMod.Hidden:
        deskDuringPreanim = false;
        deskDuringSpeaking = false;
        break;
      case DeskMod.Shown:
        deskDuringPreanim = true;
        deskDuringSpeaking = true;
        break;
      case DeskMod.HiddenDuringPreanim:
        deskDuringPreanim = false;
        deskDuringSpeaking = true;
        break;
      case DeskMod.ShownDuringPreanim:
        deskDuringPreanim = true;
        deskDuringSpeaking = false;
        break;
      case DeskMod.HiddenIgnoreOffset:
        deskDuringPreanim = false;
        deskDuringSpeaking = true;
        skipOffset = true;
        break;
      case DeskMod.ShownIgnoreOffset:
        deskDuringPreanim = true;
        deskDuringSpeaking = false;
        skipOffset = true;
        break;
      default:
        deskDuringPreanim = true;
        deskDuringSpeaking = true;
        break;
    }
  }

  return {
    side,
    useFullView,
    showSpeedlines,
    deskDuringPreanim,
    deskDuringSpeaking,
    skipOffset,
    backgroundUrl: manifest.backgroundUrl,
    deskUrl: manifest.deskUrl,
    speedLinesUrl: manifest.speedLinesUrl,
  };
}

function buildChatboxDisplay(packet: MSPacket, charIni: CharIni): ChatboxDisplay {
  const content = packet.content;
  const chat = charIni.chat;
  const visible = content.trim() !== "";
  const showname = packet.showname;

  return {
    visible,
    nameplate: showname !== "" ? showname : charIni.showname,
    showname,
    chatboxAsset: chat !== "default" && chat !== "" ? chat : null,
  };
}

function buildEvidenceDisplay(
  packet: MSPacket,
  evidences: { icon: string }[],
): EvidenceDisplay | null {
  const evidence = packet.evidence;
  if (evidence <= 0 || evidence > evidences.length) return null;

  return {
    iconPath: evidences[evidence - 1].icon,
    position: packet.side === "def" ? "right" : "left",
  };
}

function buildInitialEffects(packet: MSPacket): InitialEffects {
  return {
    screenshake: packet.screenshake,
    realization: packet.realization,
  };
}

function buildOverlayEffect(
  packet: MSPacket,
  manifest: PreloadManifest,
): OverlayEffect | null {
  const effects = packet.effects;
  if (!effects[0]) return null;

  const effectName = effects[0].toLowerCase();
  const badEffects = ["", "-", "none"];

  if (effectName.startsWith("rain")) {
    let intensity = 200;
    if (effectName.endsWith("weak")) intensity = 100;
    else if (effectName.endsWith("strong")) intensity = 400;
    return { kind: "rain", intensity };
  }

  if (!badEffects.includes(effectName)) {
    const path = manifest.effectUrl ??
      `themes/default/effects/${encodeURI(effectName)}.webp`;
    return { kind: "image", path };
  }

  return null;
}

const PANORAMIC_SIDES = ["def", "pro", "wit"];

function buildSlidePhase(
  packet: MSPacket,
  previousSide: string,
): SlidePhase | null {
  if (packet.slide !== 1) return null;
  if (previousSide === packet.side) return null;
  if (!PANORAMIC_SIDES.includes(previousSide) || !PANORAMIC_SIDES.includes(packet.side)) return null;
  // Zoom emotes never trigger slide
  if (packet.emoteModifier === EmoteModifier.Zoom || packet.emoteModifier === EmoteModifier.PreanimZoom) return null;

  return {
    fromSide: previousSide,
    toSide: packet.side,
    durationMs: 500,
    bookendDelayMs: 300,
  };
}

// ─── Main Builder ────────────────────────────────────

export function buildRenderSequence(
  packet: MSPacket,
  charIni: CharIni,
  manifest: PreloadManifest,
  evidences: { icon: string }[],
  aomlRules: AomlRules,
  aoHost: string,
  baseTickMs: number,
  previousSide: string,
): RenderSequence {
  // Resolve blip URL from manifest or construct it
  const blipUrl = manifest.blipUrl ??
    `${aoHost}sounds/blips/${encodeURI((charIni.blips || "male").toLowerCase())}.opus`;

  // Handle sound fallback from effects[2]
  let resolvedSfx = packet.sfx;
  const soundChecks = ["0", "1", ""];
  if (soundChecks.includes(resolvedSfx)) {
    if (packet.effects[2]) {
      resolvedSfx = packet.effects[2];
    }
  }

  return {
    characters: buildCharacterTimelines(packet, manifest, resolvedSfx),
    layout: buildPositionLayout(packet, manifest),
    chatbox: buildChatboxDisplay(packet, charIni),
    text: buildTextDisplay(
      packet.content,
      packet.textColor,
      aomlRules,
      baseTickMs,
      blipUrl,
      packet.additive,
    ),
    shout: buildShoutPhase(packet, manifest, aoHost),
    slide: buildSlidePhase(packet, previousSide),
    evidence: buildEvidenceDisplay(packet, evidences),
    initialEffects: buildInitialEffects(packet),
    overlay: buildOverlayEffect(packet, manifest),
  };
}
