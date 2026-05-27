import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

/**
 * `animation` is the testimony/judgeruling string. The wire format may
 * include a `#`-delimited suffix (e.g. `judgeruling#0`); since `#` is the
 * field separator, that suffix arrives as a second arg. The handler reads
 * it from `judgeId` only when `animation === "judgeruling"`.
 */
export interface RTPacket {
  animation: string;
  judgeId?: number;
}

export const RT: PacketCodec<RTPacket> = {
  decode(args) {
    const packet: RTPacket = { animation: unescapeChat(args[1] ?? "") };
    if (args[2] !== undefined && args[2] !== "") {
      packet.judgeId = Number(args[2]);
    }
    return packet;
  },
  encode(packet) {
    const animation = escapeChat(packet.animation);
    if (packet.judgeId !== undefined) {
      return `RT#${animation}#${packet.judgeId}#%`;
    }
    return `RT#${animation}#%`;
  },
};
