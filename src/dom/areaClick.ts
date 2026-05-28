import { client } from "../client";
import { sendMC } from "../packets/MC";
import { renderPlayerList } from "./renderPlayerList";
/**
 * Triggered when an item on the area list is clicked.
 * @param {HTMLElement} el
 */
export function area_click(el: HTMLElement) {
  const area = client.areas[el.id.substring(4)].name;
  sendMC({ track: area, charId: client.charID });

  const areaHr = document.createElement("div");
  areaHr.className = "hrtext";
  areaHr.textContent = `switched to ${el.textContent}`;
  document.getElementById("client_log")!.appendChild(areaHr);
  client.area = Number(el.id.substring(4));
  renderPlayerList();
}
