/**
 * Inbound handlers for the post-connection handshake sequence.
 *
 * Order on a fresh connection:
 *   decryptor -> (we send HI) -> ID -> PN -> (download phase, see
 *   handleCharacterInfo / addTrack / pickEvidence) -> DONE.
 */

import { client, clientState, autoChar, autoArea } from "../client";
import { area_click } from "../dom/areaClick";
import queryParser from "../utils/queryParser";
import { version } from "../version";
import type * as aolib from "../aolib";

const { mode } = queryParser();

/**
 * decryptor: legacy FantaCrypt handshake marker. aolib auto-flips the
 * session into JSON mode when `value === "JSON"`; we kick off the
 * client-side join by sending HI.
 */
export function applyEncryptionMode() {
  client.joinServer();
}

/**
 * ID: server identity packet. Some legacy servers (serverD) pack
 * `software` and `version` together separated by `&`; we tolerate that
 * quirk here rather than in the schema.
 *
 * webAO doesn't push a PN, so we synthesise an empty one locally to
 * keep the UI happy. Every other server (akashi, tsuserver, KFO, ...)
 * gates the rest of the handshake on receiving our own ID reply — if
 * we don't send one back, the server just sits there after its ID
 * and the join stalls.
 */
export function applyServerIdentity(packet: aolib.IDPacket) {
  client.playerID = packet.player_id;
  const serverSoftware = packet.software.split("&")[0];
  if (serverSoftware === "webAO") {
    client.server.receive("PN#0#1#%");
  } else {
    client.server.send.ID({ software: "webAO", version });
  }
}

/** PN: server population. Triggers the character list request. */
export function applyServerInfo(_packet: aolib.PNPacket) {
  client.server.send.askchaa({});
}

/**
 * DONE: handshake complete. Reveal the char-select UI (unless we're a
 * spectator), then honor `?char=` / `?area=` autopick params from the
 * URL by clicking the matching area/char.
 */
export function finishServerJoin() {
  client.state = clientState.Joined;
  document.getElementById("client_loading")!.style.display = "none";
  if (mode === "watch") {
    // Spectators don't need to pick a character
    document.getElementById("client_waiting")!.style.display = "none";
  }

  if (autoArea) {
    const areaIndex = client.areas.findIndex(
      (a: any) => a && a.name.toLowerCase() === autoArea.toLowerCase(),
    );
    if (areaIndex !== -1) {
      const el = document.getElementById(`area${areaIndex}`);
      if (el) area_click(el as HTMLElement);
    }
  }

  if (autoChar) {
    // Hide charselect immediately (spectator mode) so the user isn't stuck
    // on the selection screen. If the CC request succeeds, PV will confirm.
    document.getElementById("client_waiting")!.style.display = "none";
    document.getElementById("client_charselect")!.style.display = "none";

    const charIndex = client.chars.findIndex(
      (c: any) => c && c.name.toLowerCase() === autoChar.toLowerCase(),
    );
    if (charIndex !== -1) {
      client.server.send.CC({ char_id: charIndex });
    }
  }
}
