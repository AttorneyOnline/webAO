import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";
import { version } from "../version";

export interface HIPacket {
  hdid: string;
}

export const HI: PacketCodec<HIPacket> = {
  header: "HI",
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
  client.sendToSelf(`ID#1#webAO#${version}#%`);
  client.sendToSelf(
    "FL#fastloading#yellowtext#cccc_ic_support#flipping#looping_sfx#effects#%",
  );
};
