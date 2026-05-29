import { client } from "../client";
import { area_click } from "../dom/areaClick";
import { safeHtmlTags } from "../escaping";

export function createArea(id: number, aname: string) {
  const name = safeHtmlTags(aname);
  const thisarea = {
    name,
    players: 0,
    status: "IDLE",
    cm: "",
    locked: "FREE",
  };

  client.areas.push(thisarea);

  // Create area button
  const newarea = document.createElement("SPAN");
  newarea.className = "area-button area-default";
  newarea.id = `area${id}`;
  newarea.innerText = thisarea.name;
  newarea.title =
    `Players: ${thisarea.players}\n` +
    `Status: ${thisarea.status}\n` +
    `CM: ${thisarea.cm}\n` +
    `Area lock: ${thisarea.locked}`;
  newarea.onclick = function () {
    area_click(newarea);
  };

  document.getElementById("areas")!.appendChild(newarea);
}

import type * as aolib from "../aolib";

/** FA: server pushes the full area list (replaces local cache). */
export function applyFullAreaList(packet: aolib.FAPacket) {
  client.resetAreaList();
  for (let i = 0; i < packet.areas.length; i++) {
    createArea(i, packet.areas[i]);
  }
}

/**
 * ARUP: per-area status update. `update_type` discriminates which
 * column changes (player count / status / CM / lock state) and the
 * positional payload carries the new values per area index.
 */
export function applyAreaStatus(packet: aolib.ARUPPacket) {
  const { update_type, update_data } = packet;
  for (let i = 0; i < update_data.length; i++) {
    if (!client.areas[i]) continue; // server may send ARUP before FA
    const thisarea = document.getElementById(`area${i}`)!;
    switch (update_type) {
      case 0:
        client.areas[i].players = Number(update_data[i]);
        break;
      case 1:
        client.areas[i].status = safeHtmlTags(String(update_data[i]));
        break;
      case 2:
        client.areas[i].cm = safeHtmlTags(String(update_data[i]));
        break;
      case 3:
        client.areas[i].locked = safeHtmlTags(String(update_data[i]));
        break;
    }

    thisarea.className = `area-button area-${client.areas[i].status.toLowerCase()}`;
    thisarea.innerText = `${client.areas[i].name} (${client.areas[i].players}) [${client.areas[i].status}]`;
    thisarea.title =
      `Players: ${client.areas[i].players}\n` +
      `Status: ${client.areas[i].status}\n` +
      `CM: ${client.areas[i].cm}\n` +
      `Area lock: ${client.areas[i].locked}`;
  }
}
