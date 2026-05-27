import { client } from "../client";
import { renderPlayerList } from "../dom/renderPlayerList";
import type { PacketCodec } from "../packets";

export interface PRPacket {
  id: number;
  type: number;
}

export const PR: PacketCodec<PRPacket> = {
  decode(args) {
    return { id: Number(args[1]), type: Number(args[2]) };
  },
  encode(packet) {
    return `PR#${packet.id}#${packet.type}#%`;
  },
};

/**
 * Handles a player joining or leaving
 */
export const handlePR = (packet: PRPacket) => {
  if (packet.type === 0) {
    client.playerlist.set(packet.id, { charId: -1, charName: "", showName: "", name: "", area: 0 });
  } else if (packet.type === 1) {
    client.playerlist.delete(packet.id);
  }
  renderPlayerList();
};
