import { client } from "../client";
import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";
import { version } from "../version";

export interface HIPacket {
  hdid: string;
}

export const HI: PacketCodec<HIPacket> = {
  header: "HI",
  decode(args) {
    return { hdid: unescapeFanta(args[1] ?? "") };
  },
  encode(packet) {
    return `HI#${escapeFanta(packet.hdid)}#%`;
  },
};

/**
 * Handle the player
 */
export const receiveHI = (_packet: HIPacket) => {
  client.receiveData(`ID#1#webAO#${version}#%`);
  client.receiveData(
    "FL#fastloading#yellowtext#cccc_ic_support#flipping#looping_sfx#effects#%",
  );
};
