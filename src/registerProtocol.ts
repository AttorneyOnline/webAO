/**
 * Protocol dispatch table.
 *
 * One line per packet, mapping each header to its domain-action handler.
 * The handlers live in the modules that own the domain they touch
 * (voice handlers in `src/voice/voice.ts`, character handlers in
 * `src/client/handleCharacterInfo.ts`, etc.); this file is just the
 * wiring layer that hooks them up to the aolib session at startup.
 *
 * The function-call form (`server.on.MS(handleChatMessage)`) checks
 * the handler signature against the schema at compile time. Wrong-
 * direction registrations are caught both statically (aolib's mapped
 * types) and at runtime (aolib throws a role-aware error). Wire-format
 * encode/decode, defaults, and chat-escape are all owned by aolib.
 */

import * as aolib from "./aolib";

// ---------------------------------------------------------------------
// Server -> client handlers.
// ---------------------------------------------------------------------

// Areas
import { applyAreaStatus, applyFullAreaList } from "./client/createArea";

// Assets
import { applyAssetOrigin } from "./client/aoHost";

// Banlist / kick / blocking alerts
import {
  showBlockingAlert,
  showBanDialog,
  showKickAndBanScreen,
  showKickScreen,
} from "./client/handleBans";

// Background change
import { applyBackgroundChange } from "./viewport/utils/setSide";

// Character downloads
import {
  applyCharacterBatch,
  applyFullCharacterList,
} from "./client/handleCharacterInfo";

// Character pick
import { applyCharacterPick } from "./client/changeChar";

// Character availability grid
import { applyCharacterAvailability } from "./dom/pickChar";

// Chat (OOC + modcall)
import { appendOOCMessage, showModcallNotice } from "./dom/oocLog";

// Evidence
import { applyEvidenceInfo, applyEvidenceList } from "./dom/pickEvidence";

// Feature flags
import { applyFeatureFlags } from "./client/featureFlags";

// Handshake
import {
  applyEncryptionMode,
  applyServerIdentity,
  applyServerInfo,
  finishServerJoin,
} from "./client/handshake";

// Health bars
import { applyHealthBar } from "./dom/healthBar";

// In-character chat
import { handleChatMessage } from "./viewport/utils/handleICSpeaking";

// Judge panel + side change
import { applyCharacterSide, toggleJudgePanel } from "./dom/updateActionCommands";

// Mod authentication
import { applyModAuth } from "./dom/applyModAuth";

// Music
import {
  applyEvidenceListBatch,
  applyFullMusicList,
  applyMusicListBatch,
} from "./client/addTrack";
import { applyMusicSeek, playMusicChange } from "./viewport/utils/playMusic";

// Player roster
import {
  applyPlayerFieldUpdate,
  applyPlayerRosterChange,
} from "./dom/renderPlayerList";

// Server counts (kicks off download)
import { applyServerCounts } from "./client/fetchLists";

// Testimony state
import { applyTestimonyState } from "./viewport/utils/initTestimonyUpdater";

// Timer
import { applyTimerUpdate } from "./dom/timer";

// Voice
import {
  applyVoiceCapabilities,
  applyVoicePeerList,
  applyVoicePeerSpeak,
  handleVoiceAudio,
  handleVoicePeerJoin,
  handleVoicePeerLeave,
} from "./voice/voice";

// ---------------------------------------------------------------------
// Client -> server handlers (replay-mode synthesis only).
// ---------------------------------------------------------------------

import {
  onAreaCharRequest,
  onCharacterChoose,
  onCharacterListRequest,
  onClientIdentified,
  onClientIdentify,
  onMusicListRequest,
  onReady,
} from "./client/replay";

// ---------------------------------------------------------------------
// Registration. Called once from client.ts after both sessions exist.
// ---------------------------------------------------------------------

export function registerProtocol(
  server: aolib.ServerSession,
  clientSession: aolib.ClientSession,
): void {
  // ---- server -> client ----
  server.on.ARUP(applyAreaStatus);
  server.on.ASS(applyAssetOrigin);
  server.on.AUTH(applyModAuth);
  server.on.BB(showBlockingAlert);
  server.on.BD(showBanDialog);
  server.on.BN(applyBackgroundChange);
  server.on.CHECK(() => {});
  server.on.CharsCheck(applyCharacterAvailability);
  server.on.CI(applyCharacterBatch);
  server.on.CT(appendOOCMessage);
  server.on.decryptor(applyEncryptionMode);
  server.on.DONE(finishServerJoin);
  server.on.EI(applyEvidenceInfo);
  server.on.EM(applyEvidenceListBatch);
  server.on.FA(applyFullAreaList);
  server.on.FL(applyFeatureFlags);
  server.on.FM(applyFullMusicList);
  server.on.HP(applyHealthBar);
  server.on.ID(applyServerIdentity);
  server.on.JD(toggleJudgePanel);
  server.on.KB(showKickAndBanScreen);
  server.on.KK(showKickScreen);
  server.on.LE(applyEvidenceList);
  server.on.MC(playMusicChange);
  server.on.MS(handleChatMessage);
  server.on.PN(applyServerInfo);
  server.on.PR(applyPlayerRosterChange);
  server.on.PU(applyPlayerFieldUpdate);
  server.on.PV(applyCharacterPick);
  server.on.RMC(applyMusicSeek);
  server.on.RT(applyTestimonyState);
  server.on.SC(applyFullCharacterList);
  server.on.SI(applyServerCounts);
  server.on.SM(applyMusicListBatch);
  server.on.SP(applyCharacterSide);
  server.on.TI(applyTimerUpdate);
  server.on.VS_AUDIO(handleVoiceAudio);
  server.on.VS_CAPS(applyVoiceCapabilities);
  server.on.VS_JOIN(handleVoicePeerJoin);
  server.on.VS_LEAVE(handleVoicePeerLeave);
  server.on.VS_PEERS(applyVoicePeerList);
  server.on.VS_SPEAK(applyVoicePeerSpeak);
  server.on.ZZ(showModcallNotice);

  // ---- client -> server (replay-mode synthesis) ----
  clientSession.on.askchaa(onAreaCharRequest);
  clientSession.on.CC(onCharacterChoose);
  clientSession.on.CH(() => {});              // client keepalive — no body
  clientSession.on.HI(onClientIdentify);
  clientSession.on.ID(onClientIdentified);
  clientSession.on.RC(onCharacterListRequest);
  clientSession.on.RD(onReady);
  clientSession.on.RM(onMusicListRequest);
}
