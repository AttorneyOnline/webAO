import type {
  RenderSequence,
  RenderStep,
  StepScene,
  PositionLayout,
  EvidenceDisplay,
  TextRun,
  SegmentColor,
} from "./interfaces/RenderSequence";
import { setChatbox } from "../dom/setChatbox";
import { resizeChatbox } from "../dom/resizeChatbox";
import transparentPng from "../constants/transparentPng.js";

// ─── Context & Handle interfaces ─────────────────────

export interface RenderContext {
  aoHost: string;
  blipChannels: HTMLAudioElement[];
  sfxAudio: HTMLAudioElement;
  shoutAudio: HTMLAudioElement;
  testimonyAudio: HTMLAudioElement;
  playSFX(url: string, loop: boolean): void;
  getLastCharacter(): string;
  setLastCharacter(name: string): void;
  getLastEvidence(): number;
  setLastEvidence(evidence: number): void;
}

export interface RenderHandle {
  cancel(): void;
  readonly done: Promise<void>;
}

// ─── DOM helpers ─────────────────────────────────────

function getCharLayers(side: string): HTMLElement {
  if (["def", "pro", "wit"].includes(side)) {
    return document.getElementById(`client_${side}_char`)!;
  }
  return document.getElementById("client_char")!;
}

function getPairLayers(side: string): HTMLElement {
  if (["def", "pro", "wit"].includes(side)) {
    return document.getElementById(`client_${side}_pair_char`)!;
  }
  return document.getElementById("client_pair_char")!;
}

function getCharImg(side: string): HTMLImageElement {
  const prefix = ["def", "pro", "wit"].includes(side) ? `${side}_` : "";
  return document.getElementById(`client_${prefix}char_img`) as HTMLImageElement;
}

function getPairImg(side: string): HTMLImageElement {
  const prefix = ["def", "pro", "wit"].includes(side) ? `${side}_` : "";
  return document.getElementById(`client_${prefix}pair_img`) as HTMLImageElement;
}

function getBench(side: string): HTMLImageElement {
  if (["def", "pro", "wit"].includes(side)) {
    return document.getElementById(`client_${side}_bench`) as HTMLImageElement;
  }
  return document.getElementById("client_bench_classic") as HTMLImageElement;
}

function getCourt(side: string): HTMLImageElement {
  if (["def", "pro", "wit"].includes(side)) {
    return document.getElementById(`client_court_${side}`) as HTMLImageElement;
  }
  return document.getElementById("client_court_classic") as HTMLImageElement;
}

// ─── Executor ────────────────────────────────────────

export function executeRenderSequence(
  seq: RenderSequence,
  ctx: RenderContext,
): RenderHandle {
  console.log("[RenderSequence]", seq);
  let cancelled = false;
  let resolvePromise: () => void;
  const done = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  const cancel = () => {
    cancelled = true;
    resolvePromise();
  };

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      if (cancelled) return resolve();
      const id = setTimeout(resolve, ms);
      // Store timeout for potential cleanup (not strictly needed since cancel just flags)
    });

  const run = async () => {
    const side = seq.layout.side;

    // ── Phase 1: Reset ──────────────────────────────
    ctx.sfxAudio.loop = false;

    const gamewindow = document.getElementById("client_gamewindow")!;
    const waitingBox = document.getElementById("client_chatwaiting")!;
    const effectlayer = document.getElementById("client_fg") as HTMLImageElement;
    const shoutSprite = document.getElementById("client_shout") as HTMLImageElement;
    const eviBox = document.getElementById("client_evi") as HTMLImageElement;
    const chatContainerBox = document.getElementById("client_chatcontainer")!;
    const chatBoxInner = document.getElementById("client_inner_chat")!;
    const nameBoxInner = document.getElementById("client_inner_name")!;

    const charLayers = getCharLayers(side);
    const pairLayers = getPairLayers(side);
    const charImg = getCharImg(side);
    const pairImg = getPairImg(side);

    // Reset CSS animation
    gamewindow.style.animation = "";
    waitingBox.style.opacity = "0";

    // Check if any step has evidence (for reset tracking)
    const mainTimeline = seq.characters[0];
    const hasEvidence = mainTimeline?.steps.some(s => s.scene.evidence !== null) ?? false;

    // Evidence reset if changed
    if (ctx.getLastEvidence() !== (hasEvidence ? 1 : 0) || hasEvidence) {
      eviBox.style.opacity = "0";
      eviBox.style.height = "0%";
    }
    ctx.setLastEvidence(hasEvidence ? 1 : 0);

    // ── Phase 2: Layout ─────────────────────────────
    const fullview = document.getElementById("client_fullview")!;
    const classicview = document.getElementById("client_classicview")!;
    const bench = getBench(side);
    const court = getCourt(side);

    // View switching
    if (seq.layout.useFullView) {
      fullview.style.display = "";
      classicview.style.display = "none";
      const panOffsets: Record<string, string> = { def: "0", wit: "-200%", pro: "-400%" };
      fullview.style.left = panOffsets[side] ?? "0";
    } else {
      fullview.style.display = "none";
      classicview.style.display = "";
    }

    // Character name change detection
    // We use chatbox nameplate as a proxy for char name tracking
    const charName = seq.chatbox.nameplate;
    if (ctx.getLastCharacter() !== charName) {
      charLayers.style.opacity = "0";
      pairLayers.style.opacity = "0";
    }
    ctx.setLastCharacter(charName);

    // Set chatbox
    if (seq.chatbox.chatboxAsset) {
      setChatbox(seq.chatbox.chatboxAsset);
    } else {
      setChatbox("default");
    }
    resizeChatbox();

    if (!seq.chatbox.visible) {
      chatContainerBox.style.opacity = "0";
    }

    // Set name
    const displayname = (() => {
      const showNameCheckbox = document.getElementById("showname") as HTMLInputElement;
      if (showNameCheckbox?.checked && seq.chatbox.showname !== "") {
        return seq.chatbox.showname;
      }
      return seq.chatbox.nameplate;
    })();
    nameBoxInner.innerText = displayname;

    // Clear previous text (unless additive)
    if (!seq.text.additive) {
      chatBoxInner.innerText = "";
    }

    // Character offsets and flips
    if (!seq.layout.skipOffset) {
      charLayers.style.transform = mainTimeline?.flip ? "scaleX(-1)" : "scaleX(1)";
      if (seq.characters.length > 1) {
        pairLayers.style.transform = seq.characters[1].flip ? "scaleX(-1)" : "scaleX(1)";
      }

      // Horizontal offset by position
      const mainOffset = mainTimeline?.offset ?? { x: 0, y: 0 };
      const pairOffset = seq.characters.length > 1 ? seq.characters[1].offset : { x: 0, y: 0 };

      let baseLeft = 0;
      switch (side) {
        case "wit": baseLeft = 200; break;
        case "pro": baseLeft = 400; break;
        default: baseLeft = 0; break;
      }

      charLayers.style.left = `${baseLeft + mainOffset.x}%`;
      charLayers.style.top = `${mainOffset.y}%`;

      if (seq.characters.length > 1) {
        pairLayers.style.left = `${baseLeft + pairOffset.x}%`;
        pairLayers.style.top = `${pairOffset.y}%`;
      }
    }

    // Set blip channels
    if (seq.text.blipSound) {
      ctx.blipChannels.forEach((channel) => {
        channel.src = seq.text.blipSound;
      });
    }

    // Set initial idle sprite
    if (mainTimeline) {
      const finalStep = mainTimeline.steps[mainTimeline.steps.length - 1];
      if (finalStep.sprite) {
        charImg.src = finalStep.sprite;
      }
    }

    // Pair character initial sprite
    if (seq.characters.length > 1) {
      const pairTimeline = seq.characters[1];
      const pairFinalStep = pairTimeline.steps[pairTimeline.steps.length - 1];
      if (pairFinalStep.sprite && pairImg.src !== pairFinalStep.sprite) {
        pairImg.src = pairFinalStep.sprite;
      }
      pairLayers.style.opacity = "1";
    } else {
      pairLayers.style.opacity = "0";
    }

    charLayers.style.opacity = "1";

    // ── Phase 3: Overlay effects ────────────────────
    effectlayer.style.animation = "";
    if (seq.overlay) {
      if (seq.overlay.kind === "rain") {
        const effectCss = document.getElementById("effect_css") as HTMLLinkElement;
        if (effectCss) effectCss.href = "styles/effects/rain.css";
        let intensity = seq.overlay.intensity;
        if (intensity < effectlayer.childElementCount) effectlayer.innerHTML = "";
        else intensity = intensity - effectlayer.childElementCount;
        for (let i = 0; i < intensity; i++) {
          const drop = document.createElement("p");
          drop.style.left = Math.random() * 100 + "%";
          drop.style.animationDelay = String(Math.random()) + "s";
          effectlayer.appendChild(drop);
        }
      } else if (seq.overlay.kind === "image") {
        const effectCss = document.getElementById("effect_css") as HTMLLinkElement;
        if (effectCss) effectCss.href = "";
        effectlayer.innerHTML = "";
        effectlayer.src = seq.overlay.path;
      }
    } else {
      effectlayer.innerHTML = "";
      effectlayer.src = transparentPng;
    }

    if (cancelled) return;

    // ── Phase 4: Shout ──────────────────────────────
    if (seq.shout) {
      chatContainerBox.style.opacity = "0";
      shoutSprite.src = seq.shout.image;
      shoutSprite.style.display = "block";
      if (!seq.shout.isCustom) {
        shoutSprite.style.animation = "bubble 700ms steps(10, jump-both)";
      }
      ctx.shoutAudio.src = seq.shout.sound;
      ctx.shoutAudio.play().catch(() => {});

      await delay(seq.shout.durationMs);
      if (cancelled) return;

      shoutSprite.style.display = "none";
      shoutSprite.style.animation = "";
    }

    // ── Phase 5: Slide ──────────────────────────────
    if (seq.slide) {
      const fullview = document.getElementById("client_fullview")!;
      const positionLeftMap: Record<string, string> = {
        def: "0", wit: "-200%", pro: "-400%",
      };

      // Start at old position (no transition)
      fullview.style.transition = "none";
      fullview.style.left = positionLeftMap[seq.slide.fromSide] ?? "0";

      // Force reflow to apply the starting position
      void fullview.offsetHeight;

      // Pre-transition bookend delay
      await delay(seq.slide.bookendDelayMs);
      if (cancelled) return;

      // Animate to new position
      const durationSec = seq.slide.durationMs / 1000;
      fullview.style.transition = `left ${durationSec}s cubic-bezier(0.42, 0, 0.58, 1)`;
      fullview.style.left = positionLeftMap[seq.slide.toSide] ?? "0";

      // Wait for animation + post-transition bookend
      await delay(seq.slide.durationMs + seq.slide.bookendDelayMs);
      if (cancelled) return;

      // Clean up: restore pantilt setting
      const pantiltCheckbox = document.getElementById("client_pantilt") as HTMLInputElement;
      fullview.style.transition = pantiltCheckbox?.checked ? "0.5s ease-in-out" : "none";
    }

    // ── Phase 6: Initial effects ────────────────────
    if (seq.initialEffects.screenshake) {
      ctx.playSFX(`${ctx.aoHost}sounds/general/sfx-stab.opus`, false);
      gamewindow.style.animation = "shake 0.2s 1";
    }
    if (seq.initialEffects.realization) {
      ctx.playSFX(`${ctx.aoHost}sounds/general/sfx-realization.opus`, false);
      effectlayer.style.animation = "flash 0.4s 1";
    }

    if (cancelled) return;

    // ── Step loop: preanim + speaking ─────────────────
    shoutSprite.style.display = "none";
    shoutSprite.style.animation = "";

    let textCrawlPromise: Promise<void> | null = null;

    if (mainTimeline) {
      for (const step of mainTimeline.steps) {
        if (cancelled) return;

        // Apply scene state
        applyScene(step.scene, seq.layout, bench, court, chatContainerBox, eviBox, ctx);

        // Set sprite: use talking sprite if this step will crawl text
        if (step.talking && step.textCrawl !== "none") {
          charImg.src = step.talking;
        } else if (step.sprite) {
          charImg.src = step.sprite;
        }

        // Play SFX
        if (step.sfx) {
          if (step.sfx.delayMs > 0) {
            const sfx = step.sfx;
            setTimeout(() => {
              if (!cancelled) {
                ctx.playSFX(sfx.path, sfx.loop);
              }
            }, sfx.delayMs);
          } else {
            ctx.playSFX(step.sfx.path, step.sfx.loop);
          }
        }

        // Text crawl
        if (step.textCrawl === "await") {
          await (textCrawlPromise ?? runTextCrawl(seq, ctx, chatBoxInner, waitingBox, () => cancelled));
          textCrawlPromise = null;
        } else if (step.textCrawl === "concurrent") {
          textCrawlPromise = runTextCrawl(seq, ctx, chatBoxInner, waitingBox, () => cancelled);
        }

        // Wait for step duration
        if (step.durationMs !== null) {
          await delay(step.durationMs);
        }
      }
    }

    // Catch-all: if concurrent crawl outlasts all steps
    if (textCrawlPromise) await textCrawlPromise;

    if (cancelled) return;

    // ── Idle ──────────────────────────────────────────
    const finalStep = mainTimeline?.steps[mainTimeline.steps.length - 1];
    if (finalStep?.sprite) {
      charImg.src = finalStep.sprite;
    }
    charLayers.style.opacity = "1";
    waitingBox.style.opacity = "1";

    resolvePromise();
  };

  run().catch((err) => {
    console.error("RenderSequence execution error:", err);
    resolvePromise();
  });

  return { cancel, done };
}

// ─── Scene Apply ─────────────────────────────────────

function showEvidence(
  evidence: EvidenceDisplay,
  eviBox: HTMLImageElement,
  ctx: RenderContext,
): void {
  eviBox.src = evidence.iconPath;
  eviBox.style.width = "auto";
  eviBox.style.height = "36.5%";
  eviBox.style.opacity = "1";
  ctx.testimonyAudio.src = `${ctx.aoHost}sounds/general/sfx-evidenceshoop.opus`;
  ctx.testimonyAudio.play().catch(() => {});

  if (evidence.position === "right") {
    eviBox.style.right = "1em";
    eviBox.style.left = "initial";
  } else {
    eviBox.style.right = "initial";
    eviBox.style.left = "1em";
  }
}

function applyScene(
  scene: StepScene,
  layout: PositionLayout,
  bench: HTMLImageElement,
  court: HTMLImageElement,
  chatContainer: HTMLElement,
  eviBox: HTMLImageElement,
  ctx: RenderContext,
): void {
  if (scene.backgroundUrl) court.src = scene.backgroundUrl;
  if (scene.deskVisible && layout.deskUrl) {
    bench.src = layout.deskUrl;
    bench.style.opacity = "1";
  } else {
    bench.style.opacity = "0";
  }
  chatContainer.style.opacity = scene.chatboxVisible ? "1" : "0";
  if (scene.evidence) showEvidence(scene.evidence, eviBox, ctx);
}

// ─── Text Crawl ──────────────────────────────────────

async function runTextCrawl(
  seq: RenderSequence,
  ctx: RenderContext,
  chatBoxInner: HTMLElement,
  waitingBox: HTMLElement,
  isCancelled: () => boolean,
): Promise<void> {
  const chatBox = document.getElementById("client_chat");
  let currentBlipChannel = 0;

  for (const segment of seq.text.segments) {
    if (isCancelled()) return;

    if (segment.kind === "screenshake") {
      const gamewindow = document.getElementById("client_gamewindow")!;
      ctx.playSFX(`${ctx.aoHost}sounds/general/sfx-stab.opus`, false);
      gamewindow.style.animation = "shake 0.2s 1";
      await new Promise<void>((r) => setTimeout(r, 200));
      gamewindow.style.removeProperty("animation");
      continue;
    }

    if (segment.kind === "realization") {
      const effectlayer = document.getElementById("client_fg")!;
      ctx.playSFX(`${ctx.aoHost}sounds/general/sfx-realization.opus`, false);
      effectlayer.style.animation = "flash 0.4s 1";
      await new Promise<void>((r) => setTimeout(r, 400));
      effectlayer.style.removeProperty("animation");
      continue;
    }

    // TextRun
    const run = segment as TextRun;
    for (let i = 0; i < run.content.length; i++) {
      if (isCancelled()) return;

      const ch = run.content[i];
      const span = document.createElement("span");
      span.textContent = ch;
      applyColor(span, run.color);
      chatBoxInner.appendChild(span);

      // Play blip for non-space characters
      if (ch !== " ") {
        ctx.blipChannels[currentBlipChannel].play().catch(() => {});
        currentBlipChannel = (currentBlipChannel + 1) % ctx.blipChannels.length;
      }

      // Scroll to bottom
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

      // Wait for tick speed
      if (run.tickMs > 0 && i < run.content.length - 1) {
        await new Promise<void>((r) => setTimeout(r, run.tickMs));
      } else if (i < run.content.length - 1) {
        // Even at 0ms, yield to browser
        await new Promise<void>((r) => setTimeout(r, 0));
      }
    }
  }

  // Scroll final
  if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}

function applyColor(span: HTMLSpanElement, color: SegmentColor): void {
  if (color.kind === "named") {
    span.className = `text_${color.name}`;
  } else {
    span.style.color = `rgb(${color.r},${color.g},${color.b})`;
  }
}
