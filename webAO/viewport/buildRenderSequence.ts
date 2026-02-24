import type { ChatMsg } from "./interfaces/ChatMsg";
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
  CharacterOffset,
  TextColorName,
} from "./interfaces/RenderSequence";
import { TEXT_COLOR_NAMES } from "./interfaces/RenderSequence";
import { SHOUTS } from "./constants/shouts";

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

// ─── Shout Resources (type for the resources object) ─

export interface ShoutResources {
  [key: string]: { src: string; duration: number; sfx: string } | undefined;
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

function parseOffset(offset: string[] | number[] | undefined): CharacterOffset {
  if (!offset || offset.length < 2) return { x: 0, y: 0 };
  return { x: Number(offset[0]) || 0, y: Number(offset[1]) || 0 };
}

function buildCharacterTimelines(
  chatmsg: ChatMsg,
  manifest: PreloadManifest,
): CharacterTimeline[] {
  const timelines: CharacterTimeline[] = [];

  // Main character
  const mainSprites = manifest.characters[0];
  const hasPreanim =
    chatmsg.type === 1 &&
    chatmsg.preanim &&
    chatmsg.preanim !== "-" &&
    chatmsg.preanim !== "";

  const mainSteps: RenderStep[] = [];

  // Build SFX config for the final step
  let sfxConfig: SfxConfig | null = null;
  if (
    manifest.sfxUrl &&
    chatmsg.sound !== "0" &&
    chatmsg.sound !== "1" &&
    chatmsg.sound !== "" &&
    chatmsg.sound !== undefined &&
    (chatmsg.type === 1 || chatmsg.type === 2 || chatmsg.type === 6)
  ) {
    sfxConfig = {
      path: manifest.sfxUrl,
      delayMs: chatmsg.snddelay || 0,
      loop: !!chatmsg.looping_sfx,
    };
  }

  if (hasPreanim && mainSprites?.preanimUrl) {
    // Preanim step
    mainSteps.push({
      sprite: mainSprites.preanimUrl,
      talking: null,
      durationMs: mainSprites.preanimDuration || 0,
      nonInterrupting: chatmsg.noninterrupting_preanim === 1,
      sfx: null,
    });
  }

  // Final step (idle/talking)
  mainSteps.push({
    sprite: mainSprites?.idleUrl ?? "",
    talking: mainSprites?.talkingUrl ?? null,
    durationMs: null,
    nonInterrupting: false,
    sfx: sfxConfig,
  });

  const frameEffectsData = (chatmsg as any);
  timelines.push({
    steps: mainSteps,
    flip: chatmsg.flip === 1,
    offset: parseOffset(chatmsg.self_offset),
    frameEffects: parseFrameEffects(
      frameEffectsData.frame_screenshake ?? "",
      frameEffectsData.frame_realization ?? "",
      frameEffectsData.frame_sfx ?? "",
    ),
  });

  // Pair character
  if (chatmsg.other_name) {
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
      flip: chatmsg.other_flip === 1,
      offset: parseOffset(chatmsg.other_offset),
      frameEffects: { screenshakeFrames: [], realizationFrames: [], sfxFrames: [] },
    });
  }

  return timelines;
}

function buildTextDisplay(
  content: string,
  colorIndex: number,
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

  const defaultColorName = (TEXT_COLOR_NAMES[colorIndex] ?? "white") as TextColorName;
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
  chatmsg: ChatMsg,
  manifest: PreloadManifest,
  resources: ShoutResources,
): ShoutPhase | null {
  const objection = chatmsg.objection;
  if (!objection || objection === 0) return null;

  const shoutName = SHOUTS[objection];
  if (!shoutName) return null;

  if (objection === 4) {
    // Custom shout
    const image = manifest.shoutImageUrl ??
      `characters/${encodeURI(chatmsg.name!.toLowerCase())}/custom.gif`;
    const sound = manifest.shoutSoundUrl ?? "";
    return {
      image,
      sound,
      durationMs: resources.custom?.duration ?? 840,
      isCustom: true,
    };
  }

  const resource = resources[shoutName];
  if (!resource) return null;

  return {
    image: manifest.shoutImageUrl ?? resource.src,
    sound: manifest.shoutSoundUrl ?? resource.sfx,
    durationMs: resource.duration,
    isCustom: false,
  };
}

function buildPositionLayout(chatmsg: ChatMsg): PositionLayout {
  const side = chatmsg.side;
  const deskmod = Number(chatmsg.deskmod ?? 1);
  const type = chatmsg.type ?? 0;

  const useFullView = ["def", "pro", "wit"].includes(side);
  const showSpeedlines = type === 5 || type === 6;

  let deskDuringPreanim: boolean;
  let deskDuringSpeaking: boolean;
  let skipOffset = false;

  if (showSpeedlines) {
    deskDuringPreanim = false;
    deskDuringSpeaking = false;
  } else {
    switch (deskmod) {
      case 0:
        deskDuringPreanim = false;
        deskDuringSpeaking = false;
        break;
      case 1:
        deskDuringPreanim = true;
        deskDuringSpeaking = true;
        break;
      case 2:
        deskDuringPreanim = false;
        deskDuringSpeaking = true;
        break;
      case 3:
        deskDuringPreanim = true;
        deskDuringSpeaking = false;
        break;
      case 4:
        deskDuringPreanim = false;
        deskDuringSpeaking = true;
        skipOffset = true;
        break;
      case 5:
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
  };
}

function buildChatboxDisplay(chatmsg: ChatMsg): ChatboxDisplay {
  const content = chatmsg.content ?? "";
  const chatbox = chatmsg.chatbox ?? "";
  const visible = content.trim() !== "" && chatbox !== "";
  const showname = chatmsg.showname ?? "";
  const nameplate = chatmsg.nameplate ?? "";

  return {
    visible,
    nameplate: showname !== "" ? showname : nameplate,
    showname,
    chatboxAsset: chatbox !== "default" && chatbox !== "" ? chatbox : null,
  };
}

function buildEvidenceDisplay(
  chatmsg: ChatMsg,
  evidences: { icon: string }[],
): EvidenceDisplay | null {
  const evidence = chatmsg.evidence ?? 0;
  if (evidence <= 0 || evidence > evidences.length) return null;

  return {
    iconPath: evidences[evidence - 1].icon,
    position: chatmsg.side === "def" ? "right" : "left",
  };
}

function buildInitialEffects(chatmsg: ChatMsg): InitialEffects {
  return {
    screenshake: chatmsg.screenshake === 1,
    realization: chatmsg.flash === 1,
  };
}

function buildOverlayEffect(
  chatmsg: ChatMsg,
  manifest: PreloadManifest,
): OverlayEffect | null {
  const effects = chatmsg.effects;
  if (!effects || !effects[0]) return null;

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
  chatmsg: ChatMsg,
  previousSide: string,
): SlidePhase | null {
  if (chatmsg.slide !== 1) return null;
  if (previousSide === chatmsg.side) return null;
  if (!PANORAMIC_SIDES.includes(previousSide) || !PANORAMIC_SIDES.includes(chatmsg.side)) return null;
  // Zoom emotes (5/6) never trigger slide
  if (chatmsg.type === 5 || chatmsg.type === 6) return null;

  return {
    fromSide: previousSide,
    toSide: chatmsg.side,
    durationMs: 500,
    bookendDelayMs: 300,
  };
}

// ─── Main Builder ────────────────────────────────────

export function buildRenderSequence(
  chatmsg: ChatMsg,
  manifest: PreloadManifest,
  resources: ShoutResources,
  evidences: { icon: string }[],
  aomlRules: AomlRules,
  aoHost: string,
  baseTickMs: number,
  previousSide: string,
): RenderSequence {
  // Resolve blip URL from manifest or construct it
  const blipUrl = manifest.blipUrl ??
    `${aoHost}sounds/blips/${encodeURI((chatmsg.blips ?? "male").toLowerCase())}.opus`;

  // Handle sound fallback from effects[2] (same as handleICSpeaking)
  const soundChecks = ["0", "1", "", undefined];
  if (soundChecks.some((check) => chatmsg.sound === check)) {
    if (chatmsg.effects && chatmsg.effects[2]) {
      chatmsg.sound = chatmsg.effects[2];
    }
  }

  const additive = !!(chatmsg as any).additive;

  return {
    characters: buildCharacterTimelines(chatmsg, manifest),
    layout: buildPositionLayout(chatmsg),
    chatbox: buildChatboxDisplay(chatmsg),
    text: buildTextDisplay(
      chatmsg.content,
      chatmsg.color,
      aomlRules,
      baseTickMs,
      blipUrl,
      additive,
    ),
    shout: buildShoutPhase(chatmsg, manifest, resources),
    slide: buildSlidePhase(chatmsg, previousSide),
    evidence: buildEvidenceDisplay(chatmsg, evidences),
    initialEffects: buildInitialEffects(chatmsg),
    overlay: buildOverlayEffect(chatmsg, manifest),
  };
}
