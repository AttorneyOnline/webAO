import { client } from "../client";
import { handlePeerLeft, leaveVoice } from "../voice/voice";
import * as aolib from "../aolib";

/**
 * Voice subsystem peer-leave packet. Two wire variants:
 *
 *   - Server -> Client (`VS_LEAVEClient`): `VS_LEAVE#<uid>#%`.
 *   - Client -> Server (`VS_LEAVEServer`): `VS_LEAVE#%`.
 *     The server attaches the source uid before broadcasting.
 */

export type VS_LEAVEPacketServer = Record<string, never>;



// If it's our own uid (server auto-kicked us, e.g. on area change or mod
// /voicearea off), tear down locally.
export const handleVoicePeerLeave = (packet: aolib.Out<typeof aolib.VSLeaveBroadcast>) => {
  if (!Number.isFinite(packet.uid)) return;
  if (packet.uid === client.playerID) {
    leaveVoice();
  } else {
    handlePeerLeft(packet.uid);
  }
};
