import type { PacketCodec } from "../packets";
import { notifyRemoteSpeaking } from "../voice/voice";

/**
 * Voice subsystem speak-state packet. Two wire variants:
 *
 *   - Server -> Client (`VS_SPEAKClient`): `VS_SPEAK#<uid>#<on_off>#%`.
 *   - Client -> Server (`VS_SPEAKServer`): `VS_SPEAK#<on_off>#%`.
 *     The server attaches the source uid before broadcasting.
 */
export interface VS_SPEAKPacketClient {
  uid: number;
  on: boolean;
}

export type VS_SPEAKPacketServer = Omit<VS_SPEAKPacketClient, "uid">;

export const VS_SPEAKClient: PacketCodec<VS_SPEAKPacketClient> = {
  header: "VS_SPEAK",
  decode(args) {
    return { uid: Number(args[1]), on: args[2] === "1" };
  },
  encode(packet) {
    return `VS_SPEAK#${packet.uid}#${packet.on ? 1 : 0}#%`;
  },
};

export const VS_SPEAKServer: PacketCodec<VS_SPEAKPacketServer> = {
  header: "VS_SPEAK",
  decode(args) {
    return { on: args[1] === "1" };
  },
  encode(packet) {
    return `VS_SPEAK#${packet.on ? 1 : 0}#%`;
  },
};

export const receiveVS_SPEAK = (packet: VS_SPEAKPacketClient) => {
  if (!Number.isFinite(packet.uid)) return;
  notifyRemoteSpeaking(packet.uid, packet.on);
};
