import { setAOhost } from "../client/aoHost";
import { renderPlayerList } from "../dom/renderPlayerList";
import { escapeFanta, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";

export interface ASSPacket {
  asset_url: string;
}

export const ASS: PacketCodec<ASSPacket> = {
  header: "ASS",
  decode(args) {
    return { asset_url: unescapeFanta(args[1] ?? "") };
  },
  encode(packet) {
    return `ASS#${escapeFanta(packet.asset_url)}#%`;
  },
};

/**
 * new asset url!!
 */
export const receiveASS = (packet: ASSPacket) => {
  if (packet.asset_url !== "None") setAOhost(packet.asset_url);
  renderPlayerList();
};
