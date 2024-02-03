import { client } from '../client.js'
/**
 * Triggered when an item on the area list is clicked.
 * @param {HTMLElement} el
 */
export function area_click(el: HTMLElement) {
    const area = client.areas[el.id.substr(4)].name;
    client.sender.sendMusicChange(area);

    const areaHr = document.createElement("div");
    areaHr.className = "hrtext";
    areaHr.textContent = `switched to ${el.textContent}`;
    document.getElementById("client_log")!.appendChild(areaHr);
}
// @ts-ignore
window.area_click = area_click;
