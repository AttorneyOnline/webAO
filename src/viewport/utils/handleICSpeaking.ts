import { ChatMsg } from "../interfaces/ChatMsg";
import { client, UPDATE_INTERVAL } from "../../client";
import { appendICLog } from "../../client/appendICLog";
import { checkCallword } from "../../client/checkCallword";
import setEmoteFromUrl from "../../client/setEmoteFromUrl";
import { AO_HOST } from "../../client/aoHost";
import { SHOUTS } from "../constants/shouts";
import { setChatbox } from "../../dom/setChatbox";
import { resizeChatbox } from "../../dom/resizeChatbox";
import transparentPng from "../../constants/transparentPng";
import { COLORS } from "../constants/colors";
import mlConfig from "../../utils/aoml";
import request from "../../services/request";
import { decodeChat, safeTags } from "../../encoding";
import {
  DeskModifier,
  EmoteModifier,
  Flip,
  isFullView,
  ShoutModifier,
  Side,
  type MSPacketClient,
} from "../../packets/MS";
import preloadMessageAssets from "./preloadMessageAssets";
import { setBlipUrl } from "./blipAudio";

const SOUND_SENTINELS = new Set(["", "0", "1"]);
const BAD_EFFECTS = new Set(["", "-", "none"]);

let attorneyMarkdown: ReturnType<typeof mlConfig> | null = null;
export let markdownDisabled = false;
let markdownInitPromise: Promise<ReturnType<typeof mlConfig> | null> | null = null;

const initAttorneyMarkdown = async () => {
  if (markdownDisabled) {
    return null;
  }
  if (attorneyMarkdown !== null) {
    return attorneyMarkdown;
  }
  if (markdownInitPromise) {
    return markdownInitPromise;
  }
  markdownInitPromise = (async () => {
    try {
      const iniContent = await request(`${AO_HOST}themes/default/chat_config.ini`);
      attorneyMarkdown = mlConfig(iniContent);
      return attorneyMarkdown;
    } catch (error) {
      console.warn("Failed to load chat_config.ini, disabling markdown system:", error);
      markdownDisabled = true;
      return null;
    }
  })();
  return markdownInitPromise;
};

export let startFirstTickCheck: boolean;
export const setStartFirstTickCheck = (val: boolean) => {
  startFirstTickCheck = val;
};
export let startSecondTickCheck: boolean;
export const setStartSecondTickCheck = (val: boolean) => {
  startSecondTickCheck = val;
};
export let startThirdTickCheck: boolean;
export const setStartThirdTickCheck = (val: boolean) => {
  startThirdTickCheck = val;
};

/** Per-axis mirroring CSS transform for a Flip value. */
const flipTransform = (flip: Flip | undefined): string => {
  const x =
    flip === Flip.HORIZONTAL || flip === Flip.HORIZONTAL_AND_VERTICAL ? -1 : 1;
  const y =
    flip === Flip.VERTICAL || flip === Flip.HORIZONTAL_AND_VERTICAL ? -1 : 1;
  return `scale(${x}, ${y})`;
};

// ---------------------------------------------------------------------------
// Phase 1: build chatmsg (sync; pure mapping from packet + char.ini state)
// ---------------------------------------------------------------------------

/**
 * Builds the viewport's render state from an incoming MS packet. The
 * `ChatMsg` type is `MSPacketClient & {render-state extras}`, so we just
 * spread the packet and add the display-transformed / char-derived /
 * render-loop fields on top.
 */
const buildChatMsg = (packet: MSPacketClient): ChatMsg => {
  const char = client.chars[packet.char_id];
  const msg_nameplate = char?.showname ?? packet.character;
  const msg_blips = char?.blips ?? "male";
  const char_chatbox = char?.chat ?? "default";

  let content = safeTags(decodeChat(packet.message));
  let chatbox = char_chatbox;
  if (content.trim() === "") {
    // blankpost: empty chatbox means hide it
    content = "";
    chatbox = "";
  }

  return {
    ...packet,
    // Display-safe transforms (preanim/showname/paired_name/paired_emote
    // shadow the raw packet fields with safeTags'd versions).
    content,
    name: safeTags(packet.character),
    sprite: safeTags(packet.emote).toLowerCase(),
    sound: safeTags(packet.sfx_name).toLowerCase(),
    preanim: safeTags(packet.preanim).toLowerCase(),
    showname: safeTags(decodeChat(packet.showname)),
    paired_name: safeTags(packet.paired_name),
    paired_emote: safeTags(packet.paired_emote),
    effects: packet.effect.split("|"),
    // Char-derived
    nameplate: msg_nameplate,
    chatbox,
    blips: safeTags(msg_blips),
    // Render-loop state
    speed: UPDATE_INTERVAL,
  };
};

// ---------------------------------------------------------------------------
// Phase 2: preload assets + finish preparing (async; no DOM mutation)
// ---------------------------------------------------------------------------

/**
 * Picks the plain-spans fallback when markdown is unavailable, otherwise
 * runs the AO attorney-markdown parser.
 */
const parseContent = async (chatmsg: ChatMsg): Promise<HTMLSpanElement[]> => {
  const colorName = COLORS[chatmsg.text_color];
  if (!markdownDisabled) {
    try {
      const markdown = await initAttorneyMarkdown();
      if (markdown) {
        return markdown.applyMarkdown(chatmsg.content, colorName);
      }
    } catch {
      console.warn("markdown failed");
    }
  }
  return Array.from(chatmsg.content, (letter) => {
    const span = document.createElement("span");
    span.innerHTML = letter;
    span.className = `text_${colorName}`;
    return span;
  });
};

/**
 * Finishes preparing the chatmsg: resolves all async work (asset
 * preload, markdown parsing) and computes derived render-loop flags.
 * No DOM mutation here -- only state on the chatmsg object itself.
 */
const prepareICMessage = async (packet: MSPacketClient): Promise<ChatMsg> => {
  const chatmsg = buildChatMsg(packet);

  // Preload all assets in parallel; primes browser cache.
  chatmsg.preloadedAssets = await preloadMessageAssets(
    chatmsg,
    AO_HOST,
    client.emote_extensions,
  );
  chatmsg.preanimdelay = chatmsg.preloadedAssets.preanimDuration;

  // Animation gates (need to know hasPreanim ahead of rendering).
  const hasPreanim =
    chatmsg.emote_modifier === EmoteModifier.PREANIM &&
    chatmsg.preanim !== "-" &&
    chatmsg.preanim !== "";
  chatmsg.startpreanim = true;
  chatmsg.startspeaking = !hasPreanim;

  // `~~prefix` centers the chat text; strip the marker from content.
  if (chatmsg.content.startsWith("~~")) {
    chatmsg.content = chatmsg.content.substring(2);
  }

  // Sentinel sounds ("", "0", "1") fall back to the effect's per-character
  // sound name (third slot of the `|`-separated effects string).
  if (SOUND_SENTINELS.has(chatmsg.sound)) {
    chatmsg.sound = chatmsg.effects[2] ?? "";
  }

  // Parse content into the per-character HTMLSpanElements for the
  // typewriter loop. Markdown-aware when available, plain fallback otherwise.
  chatmsg.parsed = await parseContent(chatmsg);

  return chatmsg;
};

/**
 * Plays the shout bubble + sfx for the message, or clears the shout
 * timer if the message has no shout. The chat container is hidden
 * during the shout so it doesn't show through the bubble animation.
 */
const applyShout = (chatmsg: ChatMsg, chatContainerBox: HTMLElement) => {
  const shout = SHOUTS[chatmsg.shout_modifier];
  if (!shout) {
    client.viewport.setShoutTimer(0);
    return;
  }

  const preloaded = chatmsg.preloadedAssets!;
  const shoutSprite = <HTMLImageElement>document.getElementById("client_shout");
  chatContainerBox.style.opacity = "0";

  // Prefer the preloaded per-character bubble; fall back to the default
  // URL otherwise. Custom shouts have no default -- use the legacy
  // character/<name>/custom.gif path which the onerror handler hides
  // if it's missing.
  if (chatmsg.shout_modifier === ShoutModifier.CUSTOM) {
    shoutSprite.src =
      preloaded.shoutBubbleUrl ??
      `${AO_HOST}characters/${encodeURI(chatmsg.name.toLowerCase())}/custom.gif`;
  } else {
    shoutSprite.src = preloaded.shoutBubbleUrl ?? client.resources[shout].src;
    shoutSprite.style.animation = "bubble 700ms steps(10, jump-both)";
  }
  shoutSprite.onerror = () => {
    shoutSprite.style.display = "none";
  };
  shoutSprite.style.display = "block";

  client.viewport.shoutaudio.src = preloaded.shoutSfxUrl ?? client.resources[shout].sfx;
  client.viewport.shoutaudio.play().catch(() => {});
  client.viewport.setShoutTimer(client.resources[shout].duration);
};

/** Spawns the rain-drop DOM into the foreground layer. */
const applyRainEffect = (fg: HTMLImageElement, effectName: string) => {
  (<HTMLLinkElement>document.getElementById("effect_css")).href =
    "styles/effects/rain.css";
  let intensity = 200;
  if (effectName.endsWith("weak")) intensity = 100;
  else if (effectName.endsWith("strong")) intensity = 400;
  if (intensity < fg.childElementCount) fg.innerHTML = "";
  else intensity -= fg.childElementCount;
  for (let i = 0; i < intensity; i++) {
    const drop = document.createElement("p");
    drop.style.left = Math.random() * 100 + "%";
    drop.style.animationDelay = String(Math.random()) + "s";
    fg.appendChild(drop);
  }
};

/**
 * Applies the foreground effects overlay: rain spawns drops, named
 * effects load a webp into `client_fg`, and absent/sentinel effects
 * clear the layer.
 */
const applyEffectsOverlay = (fg: HTMLImageElement, effects: string[]) => {
  fg.style.animation = "";
  const effectName = effects[0].toLowerCase();
  if (effectName.startsWith("rain")) {
    applyRainEffect(fg, effectName);
  } else if (effects[0] && !BAD_EFFECTS.has(effectName)) {
    (<HTMLLinkElement>document.getElementById("effect_css")).href = "";
    fg.innerHTML = "";
    fg.src = `${AO_HOST}themes/default/effects/${encodeURI(effectName)}.webp`;
  } else {
    fg.innerHTML = "";
    fg.src = transparentPng;
  }
};

// ---------------------------------------------------------------------------
// Phase 3: render (sync; applies the prepared chatmsg to the DOM and
//                  starts the chat_tick animation loop)
// ---------------------------------------------------------------------------

const renderICMessage = (chatmsg: ChatMsg) => {
  client.viewport.setChatmsg(chatmsg);
  client.viewport.setTextNow("");
  client.viewport.setSfxPlayed(0);
  client.viewport.setTickTimer(0);
  client.viewport.setAnimating(true);

  startFirstTickCheck = true;
  startSecondTickCheck = false;
  startThirdTickCheck = false;
  clearTimeout(client.viewport.updater);

  // stop last sfx from looping any longer
  client.viewport.getSfxAudio().loop = false;

  const fg = <HTMLImageElement>document.getElementById("client_fg");
  const gamewindow = document.getElementById("client_gamewindow")!;
  const waitingBox = document.getElementById("client_chatwaiting")!;
  gamewindow.style.animation = "";
  waitingBox.style.opacity = "0";

  const eviBox = document.getElementById("client_evi")!;
  if (client.viewport.getLastEvidence() !== chatmsg.evidence_id) {
    eviBox.style.opacity = "0";
    eviBox.style.height = "0%";
  }
  client.viewport.setLastEvidence(chatmsg.evidence_id);

  // Full-view sides get the pan-camera layers (`client_<side>_char`);
  // everything else uses the single shared `client_char` layer.
  const fullView = isFullView(chatmsg.side);
  const charLayers = document.getElementById(
    fullView ? `client_${chatmsg.side}_char` : "client_char",
  )!;
  const pairLayers = document.getElementById(
    fullView ? `client_${chatmsg.side}_pair_char` : "client_pair_char",
  )!;

  const chatContainerBox = document.getElementById("client_chatcontainer")!;
  const nameBoxInner = document.getElementById("client_inner_name")!;
  const chatBoxInner = document.getElementById("client_inner_chat")!;

  const displayname =
    (<HTMLInputElement>document.getElementById("showname")).checked &&
    chatmsg.showname !== ""
      ? chatmsg.showname
      : chatmsg.nameplate;

  if (!chatmsg.additive) {
    chatBoxInner.innerText = client.viewport.getTextNow();
  }
  nameBoxInner.innerText = displayname;

  if (client.viewport.getLastCharacter() !== chatmsg.name) {
    charLayers.style.opacity = "0";
    pairLayers.style.opacity = "0";
  }
  client.viewport.setLastCharacter(chatmsg.name);

  appendICLog(chatmsg.content, chatmsg.showname, chatmsg.nameplate);
  checkCallword(chatmsg.content, client.viewport.getSfxAudio());

  const preloaded = chatmsg.preloadedAssets!;
  setEmoteFromUrl(preloaded.idleUrl, false, chatmsg.side);
  if (chatmsg.paired_name) {
    setEmoteFromUrl(preloaded.pairIdleUrl, true, chatmsg.side);
  }

  applyShout(chatmsg, chatContainerBox);

  // Desk visibility / speed-lines per emote_modifier + desk_modifier.
  const hasPreanim = !chatmsg.startspeaking;
  if (hasPreanim) {
    chatContainerBox.style.opacity = "0";
  } else if (chatmsg.content.trim() !== "") {
    chatContainerBox.style.opacity = "1";
  }
  const setAside = {
    position: chatmsg.side,
    showSpeedLines: false,
    showDesk: false,
  };
  let skipoffset = false;
  if (chatmsg.emote_modifier === EmoteModifier.ZOOM) {
    setAside.showSpeedLines = true;
    setAside.showDesk = false;
  } else {
    switch (chatmsg.desk_modifier) {
      case DeskModifier.SHOWN:
      case DeskModifier.SHOW_DURING_PREANIM_THEN_CENTER:
        setAside.showDesk = true;
        break;
      case DeskModifier.HIDE_AND_CENTER_DURING_PREANIM:
        skipoffset = true;
        break;
      // HIDDEN / HIDE_DURING_PREANIM / SHOW_DURING_PREANIM -> stays
      // hidden (showDesk is initialized to false above).
    }
  }
  client.viewport.set_side(setAside);

  setChatbox(chatmsg.chatbox);
  resizeChatbox();
  if (chatmsg.chatbox === "") {
    chatContainerBox.style.opacity = "0";
  }

  if (!skipoffset) {
    // Flip the character. HORIZONTAL_AND_VERTICAL handles both axes.
    charLayers.style.transform = flipTransform(chatmsg.flip);
    pairLayers.style.transform = flipTransform(chatmsg.paired_flip);

    // Shift by the horizontal offset.
    const baseLeft =
      chatmsg.side === Side.WITNESS
        ? 200
        : chatmsg.side === Side.PROSECUTION
          ? 400
          : 0;
    pairLayers.style.left = `${baseLeft + (chatmsg.paired_offset?.x ?? 0)}%`;
    charLayers.style.left = `${baseLeft + (chatmsg.offset?.x ?? 0)}%`;

    // Vertical offsets.
    pairLayers.style.top = `${chatmsg.paired_offset?.y ?? 0}%`;
    charLayers.style.top = `${chatmsg.offset?.y ?? 0}%`;
  }

  setBlipUrl(
    `${AO_HOST}sounds/blips/${encodeURI(chatmsg.blips.toLowerCase())}.opus`,
  );

  // Text alignment: `~~` prefix on the raw message centers the chat.
  // The prefix itself was stripped from `chatmsg.content` in prepare,
  // so we check the unmodified `chatmsg.message` instead.
  chatBoxInner.style.textAlign = chatmsg.message.startsWith("~~")
    ? "center"
    : "inherit";

  applyEffectsOverlay(fg, chatmsg.effects);

  charLayers.style.opacity = "1";

  client.viewport.chat_tick();
};

// ---------------------------------------------------------------------------
// Entry point: orchestrate the three phases.
// ---------------------------------------------------------------------------

/**
 * Composed pipeline: build + preload + render. Called from receiveMS.
 *
 *   prepareICMessage(packet)  // async: build chatmsg, preload, parse markdown
 *   renderICMessage(chatmsg)  // sync:  apply to DOM, start chat_tick
 */
export const handle_ic_speaking = async (packet: MSPacketClient) => {
  const chatmsg = await prepareICMessage(packet);
  renderICMessage(chatmsg);
};
