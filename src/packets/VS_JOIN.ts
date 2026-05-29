import { handlePeerJoined } from "../voice/voice";
import * as aolib from "../aolib";

/**
 * Voice subsystem peer-join packet. Two wire variants:
 *
 *   - Server -> Client (`VS_JOINClient`): `VS_JOIN#<uid>#%`.
 *   - Client -> Server (`VS_JOINServer`): `VS_JOIN#%`.
 *     The server attaches the source uid before broadcasting.
 */

export type VS_JOINPacketServer = Record<string, never>;



export const handleVoicePeerJoin = (packet: aolib.Out<typeof aolib.VSJoinBroadcast>) => {
  if (!Number.isFinite(packet.uid)) return;
  void handlePeerJoined(packet.uid);
};
