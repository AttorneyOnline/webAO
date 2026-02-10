import { client } from "../client";
/**
 * Triggered when an item on the area list is clicked.
 * @param {HTMLElement} el
 */
export function area_click(el: HTMLElement) {
  const area = client.areas[el.id.substring(4)].name;
  client.sender.sendMusicChange(area);

  const areaHr = document.createElement("div");
  areaHr.className = "hrtext";
  areaHr.textContent = `switched to ${el.textContent}`;
  document.getElementById("client_log")!.appendChild(areaHr);
  client.area = Number(el.id.substring(4));
}
window.area_click = area_click;
