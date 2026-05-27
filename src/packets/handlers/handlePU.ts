import { client } from "../../client";
import { ensureCharIni } from "../../client/handleCharacterInfo";
import { renderPlayerList } from "../../dom/renderPlayerList";
import type { PUPacket } from "../types/PU";

/**
 * Handles a playerlist update
 */
export const handlePU = (packet: PUPacket) => {
  const player = client.playerlist.get(packet.id);
  if (!player) return;

  const { data } = packet;

  switch (packet.type) {
    case 0:
      player.name = data;
      break;
    case 1: {
      player.charName = data;
      const charId = client.chars.findIndex(
        (c: any) => c && c.name.toLowerCase() === data.toLowerCase()
      );
      if (charId >= 0) {
        player.charId = charId;
        ensureCharIni(charId);
      }
      break;
    }
    case 2:
      player.showName = data;
      break;
    case 3:
      player.area = Number(data);
      break;
    default:
      break;
  }

  renderPlayerList();
};
