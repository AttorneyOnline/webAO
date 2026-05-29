/**
 * Protocol dispatch table.
 *
 * One line per packet, mapping each header to its domain-action handler.
 * The handlers live in sibling `src/packets/<HEADER>.ts` files and own
 * the actual logic (DOM updates, viewport calls, state mutation). This
 * file's only job is to wire them into the aolib session at startup.
 *
 * The function-call form (`server.on.MS(handleChatMessage)`) checks the
 * handler signature against the schema at compile time. Wrong-direction
 * registrations are caught both statically (aolib's mapped types) and at
 * runtime (aolib throws a role-aware error). Wire-format encode/decode,
 * defaults, and chat-escape are all owned by aolib — nothing here.
 */

import * as aolib from "./aolib";

// ---------------------------------------------------------------------
// Server -> client handlers. Registered on `server.on.<HEADER>`.
// Alphabetical by header for diff readability.
// ---------------------------------------------------------------------

import { applyAreaStatus } from "./packets/ARUP";
import { applyAssetOrigin } from "./packets/ASS";
import { applyModAuth } from "./packets/AUTH";
import { showBlockingAlert } from "./packets/BB";
import { showBanDialog } from "./packets/BD";
import { applyBackgroundChange } from "./packets/BN";
import { onServerKeepalive } from "./packets/CHECK";
import { applyCharacterAvailability } from "./packets/CharsCheck";
import { applyCharacterBatch } from "./packets/CI";
import { appendOOCMessage } from "./packets/CT";
import { applyEncryptionMode } from "./packets/decryptor";
import { finishServerJoin } from "./packets/DONE";
import { applyEvidenceInfo } from "./packets/EI";
import { applyEvidenceListBatch } from "./packets/EM";
import { applyFullAreaList } from "./packets/FA";
import { applyFeatureFlags } from "./packets/FL";
import { applyFullMusicList } from "./packets/FM";
import { applyHealthBar } from "./packets/HP";
import { applyServerIdentity } from "./packets/ID";
import { toggleJudgePanel } from "./packets/JD";
import { showKickAndBanScreen } from "./packets/KB";
import { showKickScreen } from "./packets/KK";
import { applyEvidenceList } from "./packets/LE";
import { playMusicChange } from "./packets/MC";
import { handleChatMessage } from "./packets/MS";
import { applyServerInfo } from "./packets/PN";
import { applyPlayerRosterChange } from "./packets/PR";
import { applyPlayerFieldUpdate } from "./packets/PU";
import { applyCharacterPick } from "./packets/PV";
import { applyMusicSeek } from "./packets/RMC";
import { applyTestimonyState } from "./packets/RT";
import { applyFullCharacterList } from "./packets/SC";
import { applyServerCounts } from "./packets/SI";
import { applyMusicListBatch } from "./packets/SM";
import { applyCharacterSide } from "./packets/SP";
import { applyTimerUpdate } from "./packets/TI";
import { handleVoiceAudio } from "./packets/VS_AUDIO";
import { applyVoiceCapabilities } from "./packets/VS_CAPS";
import { handleVoicePeerJoin } from "./packets/VS_JOIN";
import { handleVoicePeerLeave } from "./packets/VS_LEAVE";
import { applyVoicePeerList } from "./packets/VS_PEERS";
import { applyVoicePeerSpeak } from "./packets/VS_SPEAK";
import { showModcallNotice } from "./packets/ZZ";

// ---------------------------------------------------------------------
// Client -> server handlers. Registered on `clientSession.on.<HEADER>`.
// Used only in replay / acting-as-server mode where the local client
// also synthesises the server side.
// ---------------------------------------------------------------------

import { onAreaCharRequest } from "./packets/askchaa";
import { onCharacterChoose } from "./packets/CC";
import { onClientKeepalive } from "./packets/CH";
import { onClientIdentify } from "./packets/HI";
import { onCharacterListRequest } from "./packets/RC";
import { onReady } from "./packets/RD";
import { onMusicListRequest } from "./packets/RM";

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
  server.on.CHECK(onServerKeepalive);
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
  clientSession.on.CH(onClientKeepalive);
  clientSession.on.HI(onClientIdentify);
  clientSession.on.RC(onCharacterListRequest);
  clientSession.on.RD(onReady);
  clientSession.on.RM(onMusicListRequest);
}
