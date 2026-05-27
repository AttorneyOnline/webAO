import { client } from "../../client";
import { safeTags } from "../../encoding";
import type { ARUPPacket } from "../types/ARUP";

/**
 * Handle the change of players in an area.
 */
export const handleARUP = (packet: ARUPPacket) => {
  const { updateType, updateData } = packet;
  for (let i = 0; i < updateData.length; i++) {
    if (client.areas[i]) {
      // the server sends us ARUP before we even get the area list
      const thisarea = document.getElementById(`area${i}`)!;
      switch (updateType) {
        case 0: // playercount
          client.areas[i].players = Number(updateData[i]);
          break;
        case 1: // status
          client.areas[i].status = safeTags(String(updateData[i]));
          break;
        case 2:
          client.areas[i].cm = safeTags(String(updateData[i]));
          break;
        case 3:
          client.areas[i].locked = safeTags(String(updateData[i]));
          break;
      }

      thisarea.className = `area-button area-${client.areas[
        i
      ].status.toLowerCase()}`;

      thisarea.innerText = `${client.areas[i].name} (${client.areas[i].players}) [${client.areas[i].status}]`;

      thisarea.title =
        `Players: ${client.areas[i].players}\n` +
        `Status: ${client.areas[i].status}\n` +
        `CM: ${client.areas[i].cm}\n` +
        `Area lock: ${client.areas[i].locked}`;
    }
  }
};
