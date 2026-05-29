/**
 * Replay-mode synthesis handlers.
 *
 * In replay mode (`?mode=replay`) the client also plays the role of the
 * server: it captures the player's outbound packets and feeds back
 * pre-canned responses (vanilla character / music lists, default
 * background, etc.) so the UI can drive a recorded chat log without an
 * actual connection.
 *
 * These handlers are registered against `client.clientSession.on.X` —
 * the server-side session — so they only fire when something would
 * have gone out to a real server.
 */

import { client } from "../client";
import vanilla_character_arr from "../constants/characters";
import vanilla_music_arr from "../constants/music";
import { version } from "../version";
import type * as aolib from "../aolib";

/** HI: synthesise ID + FL responses so the client thinks it's handshaken. */
export const onClientIdentify = (_packet: aolib.HIPacket) => {
  client.server.receive(`ID#1#webAO#${version}#%`);
  client.server.receive(
    "FL#fastloading#yellowtext#cccc_ic_support#flipping#looping_sfx#effects#%",
  );
};

/** askchaa: respond with the vanilla SI counts. */
export const onAreaCharRequest = (_packet: aolib.askchaaPacket) => {
  client.server.receive(`SI#${vanilla_character_arr.length}#0#0#%`);
};

/** CC: synthesise a PV ack so the local UI confirms the character pick. */
export const onCharacterChoose = (packet: aolib.CCPacket) => {
  client.clientSession.send.PV({ player_id: 1, char_id: packet.char_id });
};

/** RC: respond with the bundled vanilla character list as SC. */
export const onCharacterListRequest = () => {
  client.server.receive(`SC#${vanilla_character_arr.join("#")}#%`);
};

/** RM: respond with the bundled vanilla music list as SM. */
export const onMusicListRequest = () => {
  client.server.receive(`SM#${vanilla_music_arr.join("#")}#%`);
};

/**
 * RD: feed back BN (default bg) + DONE so the UI advances, then make
 * the OOC log writable for the replay queue.
 */
export const onReady = () => {
  client.server.receive("BN#gs4#%");
  client.server.receive("DONE#%");
  const ooclog = <HTMLInputElement>document.getElementById("client_ooclog");
  ooclog.value = "";
  ooclog.readOnly = false;

  document.getElementById("client_oocinput")!.style.display = "none";
  document.getElementById("client_replaycontrols")!.style.display = "inline-block";
};
