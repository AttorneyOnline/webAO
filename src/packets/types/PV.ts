import type { PacketCodec } from "./index";

/**
 * Wire format: `PV#{player_id}#CID#{char_id}#%`. The `CID` literal at index 2
 * is hardcoded by the protocol; the codec skips it on decode and emits it on
 * encode.
 */
export interface PVPacket {
  playerId: number;
  charId: number;
}

export const PV: PacketCodec<PVPacket> = {
  decode(args) {
    return { playerId: Number(args[1]), charId: Number(args[3]) };
  },
  encode(packet) {
    return `PV#${packet.playerId}#CID#${packet.charId}#%`;
  },
};
