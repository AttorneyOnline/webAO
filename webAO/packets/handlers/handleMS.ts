import { client, UPDATE_INTERVAL } from "../../client";
import { handleCharacterInfo, ensureCharIni } from "../../client/handleCharacterInfo";
import { resetICParams } from "../../client/resetICParams";
import { safeTags } from "../../encoding";
import { getAssetPreloader } from "../../cache";
import { appendICLog } from "../../client/appendICLog";
import { checkCallword } from "../../client/checkCallword";
import { AO_HOST } from "../../client/aoHost";
import { buildRenderSequence, parseAomlRules } from "../../viewport/buildRenderSequence";
import type { AomlRules } from "../../viewport/buildRenderSequence";
import { executeRenderSequence } from "../../viewport/executeRenderSequence";
import type { RenderHandle } from "../../viewport/executeRenderSequence";
import { parseMSPacket } from "../parseMSPacket";
import type { CharIni } from "../../client/CharIni";
import request from "../../services/request.js";

// Message sequence counter to track which message should be rendered
let currentMessageSequence = 0;

// Track the previous message's courtroom side for slide transitions
let previousSide = "";

// Dedup: track content of the last message processed
let lastContent = "";

// Cached AOML rules (loaded once)
let cachedAomlRules: AomlRules | null = null;
async function getAomlRules(): Promise<AomlRules> {
  if (!cachedAomlRules) {
    try {
      const iniContent = await request(`${AO_HOST}themes/default/chat_config.ini`);
      cachedAomlRules = parseAomlRules(iniContent as string);
    } catch {
      // Fallback to empty rules if config can't be loaded
      cachedAomlRules = { byStart: new Map(), byEnd: new Map() };
    }
  }
  return cachedAomlRules;
}

// Current render handle for cancellation
let currentRender: RenderHandle | null = null;

/**
 * Handles an in-character chat message.
 * @param {*} args packet arguments
 */
export const handleMS = async (args: string[]) => {
  const packet = parseMSPacket(args);

  // Duplicate message check
  if (packet.content === lastContent) return;
  lastContent = packet.content;

  const charId = packet.charId;
  const charName = packet.charName;

  // Char.ini resolution
  if (charId < client.char_list_length && charId >= 0) {
    if (client.chars[charId].name !== charName) {
      console.info(
        `${client.chars[charId].name} is iniediting to ${charName}`,
      );
      const chargs = (`${charName}&` + "iniediter").split("&");
      handleCharacterInfo(chargs, charId);
    } else if (!client.chars[charId].options) {
      ensureCharIni(charId);
    }
  }

  const char = client.chars[charId];
  if (char?.muted) return;

  // Per-message CharIni with packet-level overrides
  const charIni: CharIni = {
    ...(char ?? {
      name: charName, showname: charName, desc: "", blips: "male",
      gender: "", side: "def", chat: "default", evidence: "",
      icon: "", muted: false,
    }),
    blips: packet.packetBlips ? safeTags(packet.packetBlips) : (char?.blips ?? "male"),
    chat: packet.content.trim() === "" ? "" : (char?.chat ?? "default"),
  };

  // Our own message appeared, reset the buttons
  if (charId === client.charID) {
    resetICParams();
  }

  // Increment sequence and capture it for this message
  currentMessageSequence++;
  const thisMessageSequence = currentMessageSequence;

  // Log message immediately to preserve order (before async preload)
  appendICLog(
    packet.content,
    packet.showname,
    charIni.showname,
  );

  // Check callword immediately as well
  checkCallword(packet.content, client.viewport.getSfxAudio());

  // Preload all assets before rendering
  const preloader = getAssetPreloader(client.emote_extensions);
  const manifest = await preloader.preloadForMessage(packet, charIni);

  // Check if a newer message arrived during preload - if so, skip rendering this one
  if (thisMessageSequence !== currentMessageSequence) {
    console.debug("Skipping render for superseded message");
    return;
  }

  if (manifest.failedAssets.length > 0) {
    console.warn("Failed to preload some assets:", manifest.failedAssets);
  }

  // Load AOML rules (cached after first load)
  const aomlRules = await getAomlRules();

  // Build the render sequence
  const sequence = buildRenderSequence(
    packet,
    charIni,
    manifest,
    client.evidences,
    aomlRules,
    AO_HOST,
    UPDATE_INTERVAL,
    previousSide,
  );

  // Track side for next message's slide transition
  previousSide = packet.side;

  // Cancel previous render if still running
  currentRender?.cancel();

  // Execute the new render sequence
  const renderContext = client.viewport.getRenderContext();
  currentRender = executeRenderSequence(sequence, renderContext);
};
