import { client } from "../client";
import { escapeChat, safeTags, unescapeChat } from "../encoding";
import type { PacketCodec } from "../packets";

/**
 * `updateType` selects what the rest of the packet means:
 *   0: player counts (numbers per area)
 *   1: area statuses (strings)
 *   2: case manager names (strings)
 *   3: locked states (strings)
 *
 * We keep `updateData` as `(number | string)[]` rather than a discriminated
 * union since the values arrive as strings on the wire and the handler picks
 * the cell-level type itself.
 */
export interface ARUPPacket {
  updateType: 0 | 1 | 2 | 3;
  updateData: (number | string)[];
}

export const ARUP: PacketCodec<ARUPPacket> = {
  decode(args) {
    const updateType = Number(args[1]) as 0 | 1 | 2 | 3;
    const rest = args.slice(2);
    const updateData =
      updateType === 0
        ? rest.map((v) => Number(v))
        : rest.map((v) => unescapeChat(v));
    return { updateType, updateData };
  },
  encode(packet) {
    const data = packet.updateData
      .map((v) => (typeof v === "string" ? escapeChat(v) : v))
      .join("#");
    return `ARUP#${packet.updateType}#${data}#%`;
  },
};

/**
 * Handle the change of players in an area.
 */
export const receiveARUP = (packet: ARUPPacket) => {
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
