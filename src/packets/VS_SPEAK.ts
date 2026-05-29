import { notifyRemoteSpeaking } from "../voice/voice";
import * as aolib from "../aolib";

/**
 * Voice subsystem speak-state packet. Two wire variants:
 *
 *   - Server -> Client (`VS_SPEAKClient`): `VS_SPEAK#<uid>#<on_off>#%`.
 *   - Client -> Server (`VS_SPEAKServer`): `VS_SPEAK#<on_off>#%`.
 *     The server attaches the source uid before broadcasting.
 */




export const applyVoicePeerSpeak = (packet: aolib.Out<typeof aolib.VSSpeakBroadcast>) => {
  if (!Number.isFinite(packet.uid)) return;
  notifyRemoteSpeaking(packet.uid, packet.on);
};
