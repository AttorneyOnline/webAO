import { setAOhost } from "../client/aoHost";
import { renderPlayerList } from "../dom/renderPlayerList";
import { escapeChat, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

export interface ASSPacket {
  assetUrl: string;
}

export const ASS: PacketCodec<ASSPacket> = {
  header: "ASS",
  decode(args) {
    return { assetUrl: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `ASS#${escapeChat(packet.assetUrl)}#%`;
  },
};

/**
 * new asset url!!
 */
export const receiveASS = (packet: ASSPacket) => {
  if (packet.assetUrl !== "None") setAOhost(packet.assetUrl);
  renderPlayerList();
};
