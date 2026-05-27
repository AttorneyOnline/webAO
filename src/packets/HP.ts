import { client } from "../client";
import type { PacketCodec } from "../packets";

export interface HPPacket {
  bar: number;
  value: number;
}

export const HP: PacketCodec<HPPacket> = {
  decode(args) {
    return { bar: Number(args[1]), value: Number(args[2]) };
  },
  encode(packet) {
    return `HP#${packet.bar}#${packet.value}#%`;
  },
};

/**
 * Handles a change in the health bars' states.
 */
export const receiveHP = (packet: HPPacket) => {
  const percent_hp = packet.value * 10;
  let healthbox;
  if (packet.bar === 1) {
    // Def hp
    client.hp[0] = packet.value;
    healthbox = document.getElementById("client_defense_hp");
  } else {
    // Pro hp
    client.hp[1] = packet.value;
    healthbox = document.getElementById("client_prosecutor_hp");
  }
  (<HTMLElement>healthbox.getElementsByClassName("health-bar")[0]).style.width =
    `${percent_hp}%`;
};

/**
 * Sends a health point change.
 */
export const sendHP = (packet: HPPacket) => {
  client.sendToServer(HP.encode(packet));
};
