import { client } from "../client";
import type { PacketCodec } from "../packets";
import { handlePeerLeft, leaveVoice } from "../voice/voice";

/**
 * Voice subsystem peer-leave packet. Two wire variants:
 *
 *   - Server -> Client (`VS_LEAVEClient`): `VS_LEAVE#<uid>#%`.
 *   - Client -> Server (`VS_LEAVEServer`): `VS_LEAVE#%`.
 *     The server attaches the source uid before broadcasting.
 */
export interface VS_LEAVEPacketClient {
  uid: number;
}

export type VS_LEAVEPacketServer = Record<string, never>;

export const VS_LEAVEClient: PacketCodec<VS_LEAVEPacketClient> = {
  header: "VS_LEAVE",
  decode(args) {
    return { uid: Number(args[1]) };
  },
  encode(packet) {
    return `VS_LEAVE#${packet.uid}#%`;
  },
};

export const VS_LEAVEServer: PacketCodec<VS_LEAVEPacketServer> = {
  header: "VS_LEAVE",
  decode() {
    return {};
  },
  encode() {
    return `VS_LEAVE#%`;
  },
};

// If it's our own uid (server auto-kicked us, e.g. on area change or mod
// /voicearea off), tear down locally.
export const receiveVS_LEAVE = (packet: VS_LEAVEPacketClient) => {
  if (!Number.isFinite(packet.uid)) return;
  if (packet.uid === client.playerID) {
    leaveVoice();
  } else {
    handlePeerLeft(packet.uid);
  }
};
