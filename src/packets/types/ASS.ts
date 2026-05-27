import { escapeChat, unescapeChat } from "../../encoding";
import type { PacketCodec } from "./index";

export interface ASSPacket {
  assetUrl: string;
}

export const ASS: PacketCodec<ASSPacket> = {
  decode(args) {
    return { assetUrl: unescapeChat(args[1] ?? "") };
  },
  encode(packet) {
    return `ASS#${escapeChat(packet.assetUrl)}#%`;
  },
};
