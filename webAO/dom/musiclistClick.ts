/**
 * Triggered when an item on the music list is clicked.
 * @param {MouseEvent} event
 */
export function musiclist_click(_event: Event) {
  const playtrack = (<HTMLInputElement>(
    document.getElementById("client_musiclist")
  )).value;
  client.sendMusicChange(playtrack);

  // This is here so you can't actually select multiple tracks,
  // even though the select tag has the multiple option to render differently
  const musiclist_elements = (<HTMLSelectElement>(
    document.getElementById("client_musiclist")
  )).selectedOptions;
  for (let i = 0; i < musiclist_elements.length; i++) {
    musiclist_elements[i].selected = false;
  }
}
window.musiclist_click = musiclist_click;
