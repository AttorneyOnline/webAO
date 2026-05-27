import { client } from "../client";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";
import { initTestimonyUpdater } from "../viewport/utils/initTestimonyUpdater";

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

/**
 * Handles a testimony states.
 */
export const handleRT = (packet: RTPacket) => {
  const judgeid = packet.judgeId ?? 0;
  switch (packet.animation) {
    case "testimony1":
      // Since 2.9: `testimony1#1` hides the indicator instead of showing it.
      if (judgeid === 1) {
        client.viewport.disposeTestimony();
        return;
      }
      client.testimonyID = 1;
      break;
    case "testimony2":
      // Cross Examination
      client.testimonyID = 2;
      break;
    case "judgeruling":
      client.testimonyID = 3 + judgeid;
      break;
    default:
      console.warn("Invalid testimony");
  }
  initTestimonyUpdater();
};
