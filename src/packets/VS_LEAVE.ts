import { client } from "../client";
import type { PacketCodec } from "../packets";
import { handlePeerLeft, leaveVoice } from "../voice/voice";

/**
 * Undocumented voice subsystem packet. Wire format: `VS_LEAVE#<uid>#%`.
 */
export interface VS_LEAVEPacket {
  uid: number;
}

export const VS_LEAVE: PacketCodec<VS_LEAVEPacket> = {
  decode(args) {
    return { uid: Number(args[1]) };
  },
  encode(packet) {
    return `VS_LEAVE#${packet.uid}#%`;
  },
};

// If it's our own uid (server auto-kicked us, e.g. on area change or mod
// /voicearea off), tear down locally.
export const handleVS_LEAVE = (packet: VS_LEAVEPacket) => {
  if (!Number.isFinite(packet.uid)) return;
  if (packet.uid === client.playerID) {
    leaveVoice();
  } else {
    handlePeerLeft(packet.uid);
  }
};
