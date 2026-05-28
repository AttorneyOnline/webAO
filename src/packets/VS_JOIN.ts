import type { PacketCodec } from "../packets";
import { handlePeerJoined } from "../voice/voice";

/**
 * Voice subsystem peer-join packet. Two wire variants:
 *
 *   - Server -> Client (`VS_JOINClient`): `VS_JOIN#<uid>#%`.
 *   - Client -> Server (`VS_JOINServer`): `VS_JOIN#%`.
 *     The server attaches the source uid before broadcasting.
 */
export interface VS_JOINPacketClient {
  uid: number;
}

export type VS_JOINPacketServer = Record<string, never>;

export const VS_JOINClient: PacketCodec<VS_JOINPacketClient> = {
  header: "VS_JOIN",
  decode(args) {
    return { uid: Number(args[1]) };
  },
  encode(packet) {
    return `VS_JOIN#${packet.uid}#%`;
  },
};

export const VS_JOINServer: PacketCodec<VS_JOINPacketServer> = {
  header: "VS_JOIN",
  decode() {
    return {};
  },
  encode() {
    return `VS_JOIN#%`;
  },
};

export const receiveVS_JOIN = (packet: VS_JOINPacketClient) => {
  if (!Number.isFinite(packet.uid)) return;
  void handlePeerJoined(packet.uid);
};
