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
  ShoutModifier,
  Side,
  type MSPacketClient,
} from "../../packets/MS";
import preloadMessageAssets from "./preloadMessageAssets";
import { setBlipUrl } from "./blipAudio";

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

/**
 * Sets a new emote.
 * This sets up everything before the tick() loops starts
 * a lot of things can probably be moved here, like starting the shout animation if there is one
 * TODO: the preanim logic, on the other hand, should probably be moved to tick()
 */
export const handle_ic_speaking = async (packet: MSPacketClient) => {
  client.viewport.setChatmsg(buildChatMsg(packet));
  client.viewport.setTextNow("");
  client.viewport.setSfxPlayed(0);
  client.viewport.setTickTimer(0);
  client.viewport.setAnimating(true);

  startFirstTickCheck = true;
  startSecondTickCheck = false;
  startThirdTickCheck = false;
  let charLayers = document.getElementById("client_char")!;
  let pairLayers = document.getElementById("client_pair_char")!;
  // stop updater
  clearTimeout(client.viewport.updater);

  // stop last sfx from looping any longer
  client.viewport.getSfxAudio().loop = false;

  const fg = <HTMLImageElement>document.getElementById("client_fg");
  const gamewindow = document.getElementById("client_gamewindow")!;
  const waitingBox = document.getElementById("client_chatwaiting")!;

  // Reset CSS animation
  gamewindow.style.animation = "";
  waitingBox.style.opacity = "0";

  const eviBox = document.getElementById("client_evi")!;

  if (
    client.viewport.getLastEvidence() !== client.viewport.getChatmsg().evidence_id
  ) {
    eviBox.style.opacity = "0";
    eviBox.style.height = "0%";
  }
  client.viewport.setLastEvidence(client.viewport.getChatmsg().evidence_id);

  // these are for the full view pan, the other positions use 'client_char'
  const validSides: Side[] = [Side.DEFENSE, Side.PROSECUTION, Side.WITNESS];
  if (validSides.includes(client.viewport.getChatmsg().side)) {
    charLayers = document.getElementById(
      `client_${client.viewport.getChatmsg().side}_char`,
    );
    pairLayers = document.getElementById(
      `client_${client.viewport.getChatmsg().side}_pair_char`,
    );
  }

  const chatContainerBox = document.getElementById("client_chatcontainer")!;
  const nameBoxInner = document.getElementById("client_inner_name")!;
  const chatBoxInner = document.getElementById("client_inner_chat")!;

  const displayname =
    (<HTMLInputElement>document.getElementById("showname")).checked &&
    client.viewport.getChatmsg().showname !== ""
      ? client.viewport.getChatmsg().showname!
      : client.viewport.getChatmsg().nameplate!;

  // Clear out the last message
  if (!client.viewport.getChatmsg().additive) {
    chatBoxInner.innerText = client.viewport.getTextNow();
  }
  nameBoxInner.innerText = displayname;

  if (
    client.viewport.getLastCharacter() !== client.viewport.getChatmsg().name
  ) {
    charLayers.style.opacity = "0";
    pairLayers.style.opacity = "0";
  }

  client.viewport.setLastCharacter(client.viewport.getChatmsg().name);

  appendICLog(
    client.viewport.getChatmsg().content,
    client.viewport.getChatmsg().showname,
    client.viewport.getChatmsg().nameplate,
  );

  checkCallword(
    client.viewport.getChatmsg().content,
    client.viewport.getSfxAudio(),
  );

  // Preload all assets before any visual changes - resolves URLs and primes browser cache
  const preloaded = await preloadMessageAssets(
    client.viewport.getChatmsg(),
    AO_HOST,
    client.emote_extensions,
  );
  client.viewport.getChatmsg().preloadedAssets = preloaded;

  // Set initial idle emote using pre-cached URLs (synchronous, images already in cache)
  setEmoteFromUrl(preloaded.idleUrl, false, client.viewport.getChatmsg().side);

  if (client.viewport.getChatmsg().paired_name) {
    setEmoteFromUrl(preloaded.pairIdleUrl, true, client.viewport.getChatmsg().side);
  }

  // gets which shout shall played
  const shoutSprite = <HTMLImageElement>document.getElementById("client_shout");

  const shout = SHOUTS[client.viewport.getChatmsg().shout_modifier];
  if (shout) {
    // Hide message box
    chatContainerBox.style.opacity = "0";
    // Prefer the preloaded per-character bubble (resolved across extensions),
    // and fall back to the default URL only when no per-character override
    // was found. For custom shouts there is no default fallback, so we use
    // the legacy character/<name>/custom.gif path which will be hidden by
    // the onerror handler below if missing.
    if (client.viewport.getChatmsg().shout_modifier === ShoutModifier.CUSTOM) {
      shoutSprite.src = preloaded.shoutBubbleUrl
        ?? `${AO_HOST}characters/${encodeURI(
          client.viewport.getChatmsg().name!.toLowerCase(),
        )}/custom.gif`;
    } else {
      shoutSprite.src = preloaded.shoutBubbleUrl ?? client.resources[shout].src;
      shoutSprite.style.animation = "bubble 700ms steps(10, jump-both)";
    }
    // Hide the broken-image alt text if the bubble fails to load.
    shoutSprite.onerror = () => {
      shoutSprite.style.display = "none";
    };
    shoutSprite.style.display = "block";

    // Use preloaded shout SFX URL (already resolved in parallel)
    client.viewport.shoutaudio.src = preloaded.shoutSfxUrl ?? client.resources[shout].sfx;
    client.viewport.shoutaudio.play().catch(() => {});
    client.viewport.setShoutTimer(client.resources[shout].duration);
  } else {
    client.viewport.setShoutTimer(0);
  }

  client.viewport.getChatmsg().startpreanim = true;

  // Use preloaded preanim duration (already computed in parallel by preloader)
  const hasPreanim =
    client.viewport.getChatmsg().emote_modifier === EmoteModifier.PREANIM &&
    client.viewport.getChatmsg().preanim !== "-" &&
    client.viewport.getChatmsg().preanim !== "";

  if (hasPreanim) {
    chatContainerBox.style.opacity = "0";
    client.viewport.getChatmsg().startspeaking = false;
  } else {
    client.viewport.getChatmsg().startspeaking = true;
    if (client.viewport.getChatmsg().content.trim() !== "")
      chatContainerBox.style.opacity = "1";
  }
  client.viewport.getChatmsg().preanimdelay = preloaded.preanimDuration;
  const setAside = {
    position: client.viewport.getChatmsg().side,
    showSpeedLines: false,
    showDesk: false,
  };
  let skipoffset: boolean = false;
  if (client.viewport.getChatmsg().emote_modifier === EmoteModifier.ZOOM) {
    setAside.showSpeedLines = true;
    setAside.showDesk = false;
    client.viewport.set_side(setAside);
  } else {
    switch (client.viewport.getChatmsg().desk_modifier) {
      case DeskModifier.HIDDEN:
        setAside.showSpeedLines = false;
        setAside.showDesk = false;
        client.viewport.set_side(setAside);
        break;
      case DeskModifier.SHOWN:
        setAside.showSpeedLines = false;
        setAside.showDesk = true;
        client.viewport.set_side(setAside);
        break;
      case DeskModifier.HIDE_DURING_PREANIM:
        setAside.showSpeedLines = false;
        setAside.showDesk = false;
        client.viewport.set_side(setAside);
        break;
      case DeskModifier.SHOW_DURING_PREANIM:
        setAside.showSpeedLines = false;
        setAside.showDesk = false;
        client.viewport.set_side(setAside);
        break;
      case DeskModifier.HIDE_AND_CENTER_DURING_PREANIM:
        setAside.showSpeedLines = false;
        setAside.showDesk = false;
        client.viewport.set_side(setAside);
        skipoffset = true;
        break;
      case DeskModifier.SHOW_DURING_PREANIM_THEN_CENTER:
        setAside.showSpeedLines = false;
        setAside.showDesk = true;
        client.viewport.set_side(setAside);
        break;
      default:
        setAside.showSpeedLines = false;
        setAside.showDesk = true;
        client.viewport.set_side(setAside);
        break;
    }
  }

  setChatbox(client.viewport.getChatmsg().chatbox);
  resizeChatbox();
  if (client.viewport.getChatmsg().chatbox === "") {
    // No chatbox means hide it
    chatContainerBox.style.opacity = "0";
  }

  if (!skipoffset) {
    // Flip the character. HORIZONTAL_AND_VERTICAL handles both axes.
    charLayers.style.transform = flipTransform(
      client.viewport.getChatmsg().flip,
    );
    pairLayers.style.transform = flipTransform(
      client.viewport.getChatmsg().paired_flip,
    );

    // Shift by the horizontal offset
    const chatmsgNow = client.viewport.getChatmsg();
    const baseLeft =
      chatmsgNow.side === Side.WITNESS
        ? 200
        : chatmsgNow.side === Side.PROSECUTION
          ? 400
          : 0;
    pairLayers.style.left = `${baseLeft + (chatmsgNow.paired_offset?.x ?? 0)}%`;
    charLayers.style.left = `${baseLeft + (chatmsgNow.self_offset?.x ?? 0)}%`;

    // Vertical offsets
    pairLayers.style.top = `${chatmsgNow.paired_offset?.y ?? 0}%`;
    charLayers.style.top = `${chatmsgNow.self_offset?.y ?? 0}%`;
  }

  setBlipUrl(
    `${AO_HOST}sounds/blips/${encodeURI(
      client.viewport.getChatmsg().blips.toLowerCase(),
    )}.opus`,
  );

  // process markup
  if (client.viewport.getChatmsg().content.startsWith("~~")) {
    chatBoxInner.style.textAlign = "center";
    client.viewport.getChatmsg().content = client.viewport
      .getChatmsg()
      .content.substring(2, client.viewport.getChatmsg().content.length);
  } else {
    chatBoxInner.style.textAlign = "inherit";
  }

  // apply effects
  fg.style.animation = "";
  const effectName = client.viewport.getChatmsg().effects[0].toLowerCase();
  const badEffects = ["", "-", "none"];
  if (effectName.startsWith("rain")) {
    (<HTMLLinkElement>document.getElementById("effect_css")).href =
      "styles/effects/rain.css";
    let intensity = 200;
    if (effectName.endsWith("weak")) {
      intensity = 100;
    } else if (effectName.endsWith("strong")) {
      intensity = 400;
    }
    if (intensity < fg.childElementCount) fg.innerHTML = "";
    else intensity = intensity - fg.childElementCount;

    for (let i = 0; i < intensity; i++) {
      const drop = document.createElement("p");
      drop.style.left = Math.random() * 100 + "%";
      drop.style.animationDelay = String(Math.random()) + "s";
      fg.appendChild(drop);
    }
  } else if (
    client.viewport.getChatmsg().effects[0] &&
    !badEffects.includes(effectName)
  ) {
    (<HTMLLinkElement>document.getElementById("effect_css")).href = "";
    fg.innerHTML = "";
    const baseEffectUrl = `${AO_HOST}themes/default/effects/`;
    fg.src = `${baseEffectUrl}${encodeURI(effectName)}.webp`;
  } else {
    fg.innerHTML = "";
    fg.src = transparentPng;
  }

  charLayers.style.opacity = "1";

  const soundChecks = ["0", "1", "", undefined];
  if (
    soundChecks.some((check) => client.viewport.getChatmsg().sound === check)
  ) {
    client.viewport.getChatmsg().sound =
      client.viewport.getChatmsg().effects[2];
  }

  const processTextOnly = () => {
    const output: HTMLSpanElement[] = [];
    for (const letter of client.viewport.getChatmsg().content) {
      const currentSelector = document.createElement("span");
      currentSelector.innerHTML = letter;
      currentSelector.className = `text_${COLORS[client.viewport.getChatmsg().text_color]}`;
      output.push(currentSelector);
    }
    client.viewport.getChatmsg().parsed = output;
  };

  if (!markdownDisabled) {
    try {
      const markdown = await initAttorneyMarkdown();
      if (markdown) {
        client.viewport.getChatmsg().parsed = markdown.applyMarkdown(
          client.viewport.getChatmsg().content,
          COLORS[client.viewport.getChatmsg().text_color],
        );
      } else {
        processTextOnly();
      }
    } catch (error) {
      console.warn("markdown failed");
      processTextOnly();
    }
  } else {
    processTextOnly();
  }

  client.viewport.chat_tick();
};
