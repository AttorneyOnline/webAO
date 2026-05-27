import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";
import { version } from "../version";

export interface HIPacket {
  hdid: string;
}

export const HI: PacketCodec<HIPacket> = {
  decode(args) {
    return { hdid: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `HI#${escapeChat(packet.hdid)}#%`;
  },
};

/**
 * Handle the player
 */
export const receiveHI = (_packet: HIPacket) => {
  client.sender.sendSelf(`ID#1#webAO#${version}#%`);
  client.sender.sendSelf(
    "FL#fastloading#yellowtext#cccc_ic_support#flipping#looping_sfx#effects#%",
  );
};
