import { client } from "../client";
/**
 * Triggered when the character search bar is changed
 * @param {MouseEvent} event
 */
export function chartable_filter(_event: Event) {
  const searchname = (<HTMLInputElement>(
    document.getElementById("client_charactersearch")
  )).value;

  client.chars.forEach((character: any, charid: number) => {
    const img = document.getElementById(`demo_${charid}`);
    if (!img) return;
    // Hide/show the container slot so the fav-btn moves with the icon
    const slot = img.parentElement as HTMLElement;
    const target = slot && slot.classList.contains("char-slot") ? slot : img;
    if (character.name.toLowerCase().indexOf(searchname.toLowerCase()) === -1) {
      target.style.display = "none";
    } else {
      target.style.display = "inline-block";
    }
  });
}
window.chartable_filter = chartable_filter;
