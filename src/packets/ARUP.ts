import { client } from "../client";
import { escapeFanta, safeHtmlTags, unescapeFanta } from "../escaping";
import type { PacketCodec } from "../packets";

/**
 * `update_type` selects what the rest of the packet means:
 *   0: player counts (numbers per area)
 *   1: area statuses (strings)
 *   2: case manager names (strings)
 *   3: locked states (strings)
 *
 * We keep `update_data` as `(number | string)[]` rather than a discriminated
 * union since the values arrive as strings on the wire and the handler picks
 * the cell-level type itself.
 */
export interface ARUPPacket {
  update_type: 0 | 1 | 2 | 3;
  update_data: (number | string)[];
}

export const ARUP: PacketCodec<ARUPPacket> = {
  header: "ARUP",
  decode(args) {
    const update_type = Number(args[1]) as 0 | 1 | 2 | 3;
    const rest = args.slice(2);
    const update_data =
      update_type === 0
        ? rest.map((v) => Number(v))
        : rest.map((v) => unescapeFanta(v));
    return { update_type, update_data };
  },
  encode(packet) {
    const data = packet.update_data
      .map((v) => (typeof v === "string" ? escapeFanta(v) : v))
      .join("#");
    return `ARUP#${packet.update_type}#${data}#%`;
  },
};

/**
 * Handle the change of players in an area.
 */
export const receiveARUP = (packet: ARUPPacket) => {
  const { update_type, update_data } = packet;
  for (let i = 0; i < update_data.length; i++) {
    if (client.areas[i]) {
      // the server sends us ARUP before we even get the area list
      const thisarea = document.getElementById(`area${i}`)!;
      switch (update_type) {
        case 0: // playercount
          client.areas[i].players = Number(update_data[i]);
          break;
        case 1: // status
          client.areas[i].status = safeHtmlTags(String(update_data[i]));
          break;
        case 2:
          client.areas[i].cm = safeHtmlTags(String(update_data[i]));
          break;
        case 3:
          client.areas[i].locked = safeHtmlTags(String(update_data[i]));
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
